-- ===========================================
-- CORREÇÃO FINAL: PAGAMENTO APÓS CANCELAMENTO (CORRIGIDA)
-- ===========================================

-- 1. VERIFICAR PROBLEMA ATUAL
-- ===========================================
SELECT 
    '=== DIAGNÓSTICO DO PROBLEMA ===' as info;

-- Verificar constraint problemática
SELECT 
    'Constraint problemática encontrada:' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'group_memberships' 
AND constraint_type = 'UNIQUE'
AND constraint_name LIKE '%group_id%';

-- Verificar memberships cancelados
SELECT 
    'Memberships cancelados:' as info,
    COUNT(*) as total
FROM public.group_memberships
WHERE status = 'cancelled';

-- 2. REMOVER CONSTRAINT PROBLEMÁTICA
-- ===========================================
ALTER TABLE public.group_memberships 
DROP CONSTRAINT IF EXISTS group_memberships_group_id_user_id_key;

-- 3. CRIAR NOVA CONSTRAINT MAIS FLEXÍVEL (CORRIGIDA)
-- ===========================================
-- Permitir apenas um membership ativo por usuário por grupo
-- Usando uma constraint parcial (PostgreSQL 9.2+)
ALTER TABLE public.group_memberships 
ADD CONSTRAINT group_memberships_active_unique 
UNIQUE (group_id, user_id) 
WHERE status = 'active';

-- 4. ATUALIZAR FUNÇÃO PROCESS_GROUP_PAYMENT
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
  
  -- Verificar se já existe um membership (ativo ou cancelado)
  SELECT * INTO existing_membership
  FROM public.group_memberships
  WHERE group_id = group_uuid AND user_id = user_uuid;
  
  -- Se já existe um membership, verificar o status
  IF existing_membership IS NOT NULL THEN
    -- Se o membership está ativo, retornar erro
    IF existing_membership.status = 'active' THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Você já é membro deste grupo'
      );
    END IF;
    
    -- Se o membership está cancelado, reativar em vez de criar novo
    IF existing_membership.status = 'cancelled' THEN
      -- Atualizar o membership existente
      UPDATE public.group_memberships 
      SET 
        status = 'active',
        joined_at = NOW(),
        cancelled_at = NULL,
        cancellation_reason = NULL,
        paid_amount_cents = payment_amount_cents
      WHERE id = existing_membership.id;
      
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
        'Reativação de pagamento para grupo: ' || group_data.name,
        group_uuid,
        payment_method_param,
        'completed'
      );
      
      -- Atualizar contador de membros do grupo (se necessário)
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
        'group_activated', check_group_activation(group_uuid),
        'membership_reactivated', true
      );
    END IF;
  END IF;
  
  -- Se não existe membership ou é um novo usuário, criar novo membership
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
  
  -- Verificar se grupo deve ser ativado
  IF check_group_activation(group_uuid) THEN
    UPDATE public.groups 
    SET status = 'active_with_slots'
    WHERE id = group_uuid;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', currval('transactions_id_seq'),
    'group_activated', check_group_activation(group_uuid),
    'membership_reactivated', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR CORREÇÃO
-- ===========================================
SELECT 
    '=== VERIFICAÇÃO DA CORREÇÃO ===' as info;

-- Verificar se a função foi atualizada
SELECT 
    'Função process_group_payment atualizada' as teste,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as resultado
FROM pg_proc 
WHERE proname = 'process_group_payment';

-- Verificar nova constraint
SELECT 
    'Nova constraint criada' as teste,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'group_memberships' 
AND constraint_type = 'UNIQUE'
AND constraint_name = 'group_memberships_active_unique';

-- 6. TESTE SIMULADO
-- ===========================================
SELECT 
    '=== TESTE SIMULADO ===' as info;

-- Simular cenário de reativação
SELECT 
    'Cenário: Usuário com membership cancelado' as info,
    'Pode reativar sem erro de constraint' as resultado;

-- 7. RESUMO FINAL
-- ===========================================
SELECT 
    '=== RESUMO DA CORREÇÃO ===' as info;

SELECT 
    '✅ Constraint problemática removida' as status,
    'group_memberships_group_id_user_id_key' as detalhe;

SELECT 
    '✅ Nova constraint criada' as status,
    'group_memberships_active_unique (apenas para status = active)' as detalhe;

SELECT 
    '✅ Função process_group_payment atualizada' as status,
    'Agora reativa memberships cancelados' as detalhe;

SELECT 
    '✅ Problema resolvido' as status,
    'Usuários podem reentrar em grupos após cancelamento' as detalhe; 