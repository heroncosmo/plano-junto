-- ===========================================
-- PLANO JUNTO - DATABASE COMPLETE SETUP (CORRIGIDO)
-- Este arquivo deve ser executado no Supabase
-- ===========================================

-- 1. FUNÇÕES DE NEGÓCIO
-- ===========================================

-- Função para calcular taxa administrativa
CREATE OR REPLACE FUNCTION calculate_admin_fee(amount_cents INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Taxa de 5% sobre o valor
  RETURN GREATEST(FLOOR(amount_cents * 0.05), 100); -- Mínimo de R$ 1,00
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se grupo pode ser ativado
CREATE OR REPLACE FUNCTION check_group_activation(group_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  group_data RECORD;
  member_count INTEGER;
BEGIN
  -- Buscar dados do grupo
  SELECT * INTO group_data 
  FROM public.groups 
  WHERE id = group_uuid;
  
  -- Contar membros atuais
  SELECT COUNT(*) INTO member_count 
  FROM public.group_memberships 
  WHERE group_id = group_uuid;
  
  -- Verificar se atingiu o número máximo de membros
  RETURN member_count >= group_data.max_members;
END;
$$ LANGUAGE plpgsql;

-- Função para processar pagamento de grupo
CREATE OR REPLACE FUNCTION process_group_payment(
  user_uuid UUID,
  group_uuid UUID,
  payment_amount_cents INTEGER,
  payment_method_param TEXT
)
RETURNS JSON AS $$
DECLARE
  user_balance INTEGER;
  group_data RECORD;
  admin_fee INTEGER;
  result JSON;
BEGIN
  -- Buscar saldo do usuário
  SELECT balance_cents INTO user_balance 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  -- Buscar dados do grupo
  SELECT * INTO group_data 
  FROM public.groups 
  WHERE id = group_uuid;
  
  -- Calcular taxa administrativa
  admin_fee := calculate_admin_fee(payment_amount_cents);
  
  -- Verificar se usuário tem saldo suficiente (se pagamento for com créditos)
  IF payment_method_param = 'credits' THEN
    IF user_balance < payment_amount_cents THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Saldo insuficiente'
      );
    END IF;
    
    -- Debitar do saldo do usuário
    UPDATE public.profiles 
    SET balance_cents = balance_cents - payment_amount_cents
    WHERE user_id = user_uuid;
  END IF;
  
  -- Criar transação do pagamento
  INSERT INTO public.transactions (
    user_id, 
    type, 
    amount_cents, 
    fee_cents,
    description, 
    group_id, 
    payment_method, 
    status
  ) VALUES (
    user_uuid,
    'group_payment',
    payment_amount_cents,
    admin_fee,
    'Pagamento para grupo: ' || group_data.name,
    group_uuid,
    payment_method_param,
    'completed'
  );
  
  -- Adicionar membro ao grupo
  INSERT INTO public.group_memberships (
    group_id,
    user_id,
    paid_amount_cents
  ) VALUES (
    group_uuid,
    user_uuid,
    payment_amount_cents
  );
  
  -- Atualizar contador de membros do grupo
  UPDATE public.groups 
  SET current_members = current_members + 1
  WHERE id = group_uuid;
  
  -- Verificar se grupo deve ser ativado
  IF check_group_activation(group_uuid) THEN
    UPDATE public.groups 
    SET status = 'active_with_slots'
    WHERE id = group_uuid;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', currval('transactions_id_seq'),
    'group_activated', check_group_activation(group_uuid)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar créditos
CREATE OR REPLACE FUNCTION add_user_credits(
  user_uuid UUID,
  amount_cents INTEGER,
  payment_method_param TEXT,
  external_payment_id_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  fee_amount INTEGER;
BEGIN
  -- Calcular taxa
  fee_amount := calculate_admin_fee(amount_cents);
  
  -- Adicionar créditos ao saldo
  UPDATE public.profiles 
  SET balance_cents = balance_cents + amount_cents
  WHERE user_id = user_uuid;
  
  -- Registrar transação
  INSERT INTO public.transactions (
    user_id,
    type,
    amount_cents,
    fee_cents,
    description,
    payment_method,
    external_payment_id,
    status
  ) VALUES (
    user_uuid,
    'credit_purchase',
    amount_cents,
    fee_amount,
    'Adição de créditos',
    payment_method_param,
    external_payment_id_param,
    'completed'
  );
  
  RETURN json_build_object(
    'success', true,
    'new_balance', (SELECT balance_cents FROM public.profiles WHERE user_id = user_uuid)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para solicitar saque
CREATE OR REPLACE FUNCTION request_withdrawal(
  user_uuid UUID,
  amount_cents INTEGER,
  pix_key_param TEXT
)
RETURNS JSON AS $$
DECLARE
  user_balance INTEGER;
  min_withdrawal INTEGER := 1000; -- R$ 10,00 mínimo
BEGIN
  -- Verificar saldo
  SELECT balance_cents INTO user_balance 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  -- Verificar valor mínimo
  IF amount_cents < min_withdrawal THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Valor mínimo para saque é R$ 10,00'
    );
  END IF;
  
  -- Verificar saldo suficiente
  IF user_balance < amount_cents THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Saldo insuficiente'
    );
  END IF;
  
  -- Debitar do saldo
  UPDATE public.profiles 
  SET balance_cents = balance_cents - amount_cents
  WHERE user_id = user_uuid;
  
  -- Criar solicitação de saque
  INSERT INTO public.withdrawals (
    user_id,
    amount_cents,
    pix_key,
    status
  ) VALUES (
    user_uuid,
    amount_cents,
    pix_key_param,
    'pending'
  );
  
  -- Registrar transação
  INSERT INTO public.transactions (
    user_id,
    type,
    amount_cents,
    description,
    payment_method,
    status
  ) VALUES (
    user_uuid,
    'withdrawal',
    -amount_cents,
    'Solicitação de saque',
    'pix',
    'pending'
  );
  
  RETURN json_build_object(
    'success', true,
    'withdrawal_id', currval('withdrawals_id_seq')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. VIEWS ÚTEIS
-- ===========================================

-- View para estatísticas de usuário
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.user_id,
  p.full_name,
  p.balance_cents,
  p.verification_status,
  COALESCE(gm_count.group_count, 0) as groups_joined,
  COALESCE(g_count.groups_created, 0) as groups_created,
  COALESCE(t_sum.total_spent_cents, 0) as total_spent_cents
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as group_count 
  FROM public.group_memberships 
  GROUP BY user_id
) gm_count ON p.user_id = gm_count.user_id
LEFT JOIN (
  SELECT admin_id, COUNT(*) as groups_created 
  FROM public.groups 
  GROUP BY admin_id
) g_count ON p.user_id = g_count.admin_id
LEFT JOIN (
  SELECT user_id, SUM(amount_cents) as total_spent_cents 
  FROM public.transactions 
  WHERE type = 'group_payment' AND status = 'completed'
  GROUP BY user_id
) t_sum ON p.user_id = t_sum.user_id;

-- View para grupos com informações completas
CREATE OR REPLACE VIEW groups_detailed AS
SELECT 
  g.*,
  s.name as service_name,
  s.category as service_category,
  s.icon_url as service_icon,
  p.full_name as admin_name,
  CASE 
    WHEN g.current_members >= g.max_members THEN 'full'
    WHEN g.current_members = 0 THEN 'empty'
    ELSE 'available'
  END as availability_status
FROM public.groups g
JOIN public.services s ON g.service_id = s.id
JOIN public.profiles p ON g.admin_id = p.user_id;

-- 3. DADOS INICIAIS - ADICIONAR APENAS SERVIÇOS NOVOS
-- ===========================================

-- Adicionar novos serviços sem deletar os existentes
INSERT INTO public.services (name, category, max_users, pre_approved, icon_url) VALUES
-- Streaming
('YouTube Premium', 'streaming', 6, true, '/icons/youtube.svg'),
('Amazon Prime Video', 'streaming', 3, true, '/icons/prime.svg'),
('Disney+', 'streaming', 4, true, '/icons/disney.svg'),
('HBO Max', 'streaming', 3, true, '/icons/hbo.svg'),
('Paramount+', 'streaming', 6, true, '/icons/paramount.svg'),
('Apple TV+', 'streaming', 6, true, '/icons/appletv.svg'),
('Globoplay', 'streaming', 5, true, '/icons/globoplay.svg'),
('Crunchyroll', 'streaming', 4, true, '/icons/crunchyroll.svg'),

-- Música
('YouTube Music', 'music', 6, true, '/icons/youtube-music.svg'),
('Apple Music', 'music', 6, true, '/icons/apple-music.svg'),
('Amazon Music', 'music', 6, true, '/icons/amazon-music.svg'),
('Deezer', 'music', 6, true, '/icons/deezer.svg'),

-- Educação
('Coursera', 'education', 1, true, '/icons/coursera.svg'),
('Duolingo Plus', 'education', 1, true, '/icons/duolingo.svg'),
('Skillshare', 'education', 2, true, '/icons/skillshare.svg'),

-- IA e Produtividade
('Claude Pro', 'ai', 1, true, '/icons/claude.svg'),
('GitHub Copilot', 'ai', 1, true, '/icons/github.svg'),
('Microsoft 365', 'productivity', 6, true, '/icons/microsoft.svg'),
('Notion Pro', 'productivity', 10, true, '/icons/notion.svg'),

-- Gaming
('Xbox Game Pass', 'gaming', 1, true, '/icons/xbox.svg'),
('PlayStation Plus', 'gaming', 1, true, '/icons/playstation.svg'),
('Nintendo Switch Online', 'gaming', 8, true, '/icons/nintendo.svg'),

-- Outros
('iCloud+', 'other', 6, true, '/icons/icloud.svg'),
('Google One', 'other', 6, true, '/icons/google.svg'),
('Dropbox Plus', 'other', 3, true, '/icons/dropbox.svg')
ON CONFLICT (name) DO NOTHING; -- Não inserir se já existir

-- 4. POLÍTICAS DE SEGURANÇA ATUALIZADAS
-- ===========================================

-- Permitir inserção em transactions (necessário para as funções)
DROP POLICY IF EXISTS "Users can create transactions" ON public.transactions;
CREATE POLICY "Users can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Permitir updates em profiles para saldo
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- 5. TRIGGERS PARA AUDITORIA
-- ===========================================

-- Função para log de mudanças críticas
CREATE OR REPLACE FUNCTION audit_balance_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.balance_cents != NEW.balance_cents THEN
    INSERT INTO public.transactions (
      user_id,
      type,
      amount_cents,
      description,
      status
    ) VALUES (
      NEW.user_id,
      'balance_adjustment',
      NEW.balance_cents - OLD.balance_cents,
      'Ajuste automático de saldo',
      'completed'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. ÍNDICES PARA PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_admin_id ON public.groups(admin_id);
CREATE INDEX IF NOT EXISTS idx_groups_service_id ON public.groups(service_id);
CREATE INDEX IF NOT EXISTS idx_groups_status ON public.groups(status);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON public.group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- 7. VERIFICAÇÃO DO SETUP
-- ===========================================

-- Verificar se tudo foi criado corretamente
SELECT 'Database setup completed successfully!' as status;

-- Mostrar quantos serviços temos agora
SELECT COUNT(*) as total_services FROM public.services;

-- Mostrar as funções criadas
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name; 