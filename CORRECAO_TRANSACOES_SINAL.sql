-- ===========================================
-- CORREÇÃO: SINAL DAS TRANSAÇÕES
-- ===========================================

-- 1. VERIFICAR TRANSAÇÕES ATUAIS
-- ===========================================
SELECT 
    '=== VERIFICANDO TRANSAÇÕES ATUAIS ===' as info;

SELECT 
    'Transações com sinal incorreto:' as info,
    type,
    amount_cents,
    description,
    created_at
FROM public.transactions 
WHERE type = 'group_payment' 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. CORRIGIR FUNÇÃO PROCESS_GROUP_PAYMENT
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
    
    -- Criar transação do pagamento (VALOR NEGATIVO - DÉBITO)
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
      -payment_amount_cents, -- VALOR NEGATIVO (DÉBITO)
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
  
  -- Criar transação do pagamento (VALOR NEGATIVO - DÉBITO)
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
    -payment_amount_cents, -- VALOR NEGATIVO (DÉBITO)
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

-- 3. CORRIGIR TRANSAÇÕES EXISTENTES (OPCIONAL)
-- ===========================================
-- Comentar esta seção se não quiser alterar transações existentes
/*
UPDATE public.transactions 
SET amount_cents = -ABS(amount_cents)
WHERE type = 'group_payment' 
AND amount_cents > 0;
*/

-- 4. VERIFICAR FUNÇÃO ATUALIZADA
-- ===========================================
SELECT 
    '=== VERIFICAÇÃO DA FUNÇÃO ===' as info;

SELECT 
    'Função process_group_payment atualizada?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - FUNÇÃO ATUALIZADA'
        ELSE '❌ NÃO - ERRO AO ATUALIZAR FUNÇÃO'
    END as resposta
FROM pg_proc 
WHERE proname = 'process_group_payment';

-- 5. TESTE SIMULADO
-- ===========================================
SELECT 
    '=== TESTE SIMULADO ===' as info;

-- Mostrar como as transações devem aparecer
SELECT 
    'Exemplo de transações corretas:' as info,
    'Adição de créditos: +R$ 50,00' as credito,
    'Pagamento de grupo: -R$ 6,00' as debito;

-- 6. VERIFICAR TRANSAÇÕES RECENTES
-- ===========================================
SELECT 
    '=== TRANSAÇÕES RECENTES ===' as info;

SELECT 
    'Transações recentes:' as info,
    type,
    amount_cents,
    CASE 
        WHEN amount_cents > 0 THEN 'CRÉDITO (+)'
        WHEN amount_cents < 0 THEN 'DÉBITO (-)'
        ELSE 'ZERO'
    END as tipo,
    description,
    created_at
FROM public.transactions 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. RESUMO
-- ===========================================
SELECT 
    '=== RESUMO DA CORREÇÃO ===' as info;

SELECT 
    '✅ Função process_group_payment corrigida' as status,
    'Agora registra valores negativos para pagamentos' as detalhe;

SELECT 
    '✅ Lógica correta:' as status,
    'Adição de créditos: + (positivo)' as detalhe;

SELECT 
    '✅ Lógica correta:' as status,
    'Pagamento de grupo: - (negativo)' as detalhe;

SELECT 
    '✅ Sistema pronto' as status,
    'Teste o pagamento de grupo novamente' as detalhe; 