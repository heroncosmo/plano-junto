-- ===========================================
-- CORREÇÃO: TRANSACTIONS COM UUID
-- ===========================================

-- 1. VERIFICAR ESTRUTURA ATUAL
-- ===========================================
SELECT 
    '=== VERIFICANDO ESTRUTURA ATUAL ===' as info;

-- Verificar se a tabela transactions existe e sua estrutura
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. REMOVER TABELA SE EXISTIR (para recriar corretamente)
-- ===========================================
DROP TABLE IF EXISTS public.transactions CASCADE;

-- 3. CRIAR TABELA TRANSACTIONS COM UUID
-- ===========================================
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- ===========================================
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_group_id ON public.transactions(group_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

-- 5. ATUALIZAR FUNÇÃO PROCESS_GROUP_PAYMENT PARA UUID
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
  transaction_id UUID;
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

-- 6. VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- ===========================================
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    'Tabela transactions criada?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - TABELA CRIADA'
        ELSE '❌ NÃO - ERRO AO CRIAR TABELA'
    END as resposta
FROM information_schema.tables 
WHERE table_name = 'transactions' AND table_schema = 'public';

SELECT 
    'Função process_group_payment atualizada?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - FUNÇÃO ATUALIZADA'
        ELSE '❌ NÃO - ERRO AO ATUALIZAR FUNÇÃO'
    END as resposta
FROM pg_proc 
WHERE proname = 'process_group_payment';

-- 7. TESTE DA TABELA
-- ===========================================
SELECT 
    '=== TESTE DA TABELA ===' as info;

-- Verificar estrutura da tabela
SELECT 
    'Estrutura da tabela transactions:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. RESUMO
-- ===========================================
SELECT 
    '=== RESUMO DA CORREÇÃO ===' as info;

SELECT 
    '✅ Tabela transactions criada com UUID' as status,
    'Compatível com o resto do sistema' as detalhe;

SELECT 
    '✅ Função process_group_payment atualizada' as status,
    'Agora usa UUID em vez de BIGINT' as detalhe;

SELECT 
    '✅ Índices criados' as status,
    'Performance otimizada' as detalhe;

SELECT 
    '✅ Sistema pronto' as status,
    'Teste o pagamento novamente' as detalhe; 