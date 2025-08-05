-- ===========================================
-- CORREÇÃO: SEQUENCE TRANSACTIONS_ID_SEQ NÃO EXISTE
-- ===========================================

-- 1. VERIFICAR SE A SEQUENCE EXISTE
-- ===========================================
SELECT 
    '=== VERIFICANDO SEQUENCE ===' as info;

SELECT 
    'Sequence transactions_id_seq existe?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO - PRECISA CRIAR'
    END as resposta
FROM information_schema.sequences 
WHERE sequence_name = 'transactions_id_seq';

-- 2. VERIFICAR SE A TABELA TRANSACTIONS EXISTE
-- ===========================================
SELECT 
    '=== VERIFICANDO TABELA TRANSACTIONS ===' as info;

SELECT 
    'Tabela transactions existe?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO - PRECISA CRIAR'
    END as resposta
FROM information_schema.tables 
WHERE table_name = 'transactions' AND table_schema = 'public';

-- 3. CRIAR SEQUENCE SE NÃO EXISTIR
-- ===========================================
CREATE SEQUENCE IF NOT EXISTS public.transactions_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

-- 4. CRIAR TABELA TRANSACTIONS SE NÃO EXISTIR
-- ===========================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGINT PRIMARY KEY DEFAULT nextval('public.transactions_id_seq'),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id),
    type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    fee_cents INTEGER DEFAULT 0,
    description TEXT,
    group_id UUID REFERENCES public.groups(id),
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CONFIGURAR SEQUENCE PARA A TABELA
-- ===========================================
ALTER TABLE public.transactions 
ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq');

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_group_id ON public.transactions(group_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- 7. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- ===========================================
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    'Sequence transactions_id_seq criada?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - SEQUENCE CRIADA'
        ELSE '❌ NÃO - ERRO AO CRIAR SEQUENCE'
    END as resposta
FROM information_schema.sequences 
WHERE sequence_name = 'transactions_id_seq';

SELECT 
    'Tabela transactions criada?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - TABELA CRIADA'
        ELSE '❌ NÃO - ERRO AO CRIAR TABELA'
    END as resposta
FROM information_schema.tables 
WHERE table_name = 'transactions' AND table_schema = 'public';

-- 8. TESTE DA SEQUENCE
-- ===========================================
SELECT 
    '=== TESTE DA SEQUENCE ===' as info;

-- Testar se a sequence funciona
SELECT 
    'Teste da sequence:' as info,
    nextval('public.transactions_id_seq') as proximo_valor;

-- 9. ATUALIZAR FUNÇÃO PROCESS_GROUP_PAYMENT
-- ===========================================
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
  existing_membership RECORD;
  active_membership_count INTEGER;
  transaction_id BIGINT;
BEGIN
  -- Buscar saldo do usuário
  SELECT balance_cents INTO user_balance 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  -- Buscar dados do grupo
  SELECT * INTO group_data 
  FROM public.groups 
  WHERE id = group_uuid;
  
  -- Verificar se já existe um membership ativo
  SELECT COUNT(*) INTO active_membership_count
  FROM public.group_memberships
  WHERE group_id = group_uuid AND user_id = user_uuid AND status = 'active';
  
  -- Se já existe um membership ativo, retornar erro
  IF active_membership_count > 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Você já é membro deste grupo'
    );
  END IF;
  
  -- Verificar se existe um membership cancelado
  SELECT * INTO existing_membership
  FROM public.group_memberships
  WHERE group_id = group_uuid AND user_id = user_uuid AND status = 'cancelled';
  
  -- Se existe membership cancelado, reativar
  IF existing_membership IS NOT NULL THEN
    -- Atualizar o membership existente
    UPDATE public.group_memberships 
    SET 
      status = 'active',
      joined_at = NOW(),
      cancelled_at = NULL,
      cancellation_reason = NULL,
      paid_amount_cents = payment_amount_cents
    WHERE id = existing_membership.id;
    
    -- Calcular taxa administrativa (simplificado)
    admin_fee := 0; -- Sem taxa por enquanto
    
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
      'Reativação de pagamento para grupo: ' || group_data.name,
      group_uuid,
      payment_method_param,
      'completed'
    ) RETURNING id INTO transaction_id;
    
    -- Atualizar contador de membros do grupo
    UPDATE public.groups 
    SET current_members = current_members + 1
    WHERE id = group_uuid;
    
    RETURN json_build_object(
      'success', true,
      'transaction_id', transaction_id,
      'membership_reactivated', true
    );
  END IF;
  
  -- Se não existe membership, criar novo
  -- Calcular taxa administrativa (simplificado)
  admin_fee := 0; -- Sem taxa por enquanto
  
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
  ) RETURNING id INTO transaction_id;
  
  -- Adicionar membro ao grupo
  INSERT INTO public.group_memberships (
    group_id,
    user_id,
    paid_amount_cents,
    status
  ) VALUES (
    group_uuid,
    user_uuid,
    payment_amount_cents,
    'active'
  );
  
  -- Atualizar contador de membros do grupo
  UPDATE public.groups 
  SET current_members = current_members + 1
  WHERE id = group_uuid;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'membership_reactivated', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. VERIFICAÇÃO FINAL
-- ===========================================
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    'Função process_group_payment atualizada?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - FUNÇÃO ATUALIZADA'
        ELSE '❌ NÃO - ERRO AO ATUALIZAR FUNÇÃO'
    END as resposta
FROM pg_proc 
WHERE proname = 'process_group_payment';

-- 11. RESUMO
-- ===========================================
SELECT 
    '=== RESUMO DA CORREÇÃO ===' as info;

SELECT 
    '✅ Sequence transactions_id_seq criada' as status,
    'Agora currval() funcionará corretamente' as detalhe;

SELECT 
    '✅ Tabela transactions criada' as status,
    'Todas as transações serão registradas' as detalhe;

SELECT 
    '✅ Função process_group_payment atualizada' as status,
    'Agora usa RETURNING id para capturar o ID da transação' as detalhe;

SELECT 
    '✅ Sistema pronto' as status,
    'Teste o pagamento novamente' as detalhe; 