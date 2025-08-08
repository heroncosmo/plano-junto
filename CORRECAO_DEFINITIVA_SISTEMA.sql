-- =====================================================
-- CORREÇÃO DEFINITIVA DO SISTEMA - EXECUTE NO SUPABASE
-- =====================================================

-- 1. CORRIGIR CONTADOR DE MEMBROS PARA TODOS OS GRUPOS
-- =====================================================

-- Recalcular o contador de membros baseado nos membros ativos
UPDATE public.groups 
SET current_members = (
  SELECT COUNT(*) 
  FROM public.group_memberships gm 
  WHERE gm.group_id = groups.id 
  AND gm.status = 'active'
);

-- 2. FECHAR RECLAMAÇÕES DE USUÁRIOS QUE SAÍRAM DOS GRUPOS
-- =====================================================

-- Fechar automaticamente reclamações de usuários que não estão mais ativos no grupo
UPDATE public.complaints 
SET 
  status = 'closed',
  resolved_at = NOW(),
  updated_at = NOW()
WHERE 
  status IN ('pending', 'admin_responded', 'user_responded')
  AND NOT EXISTS (
    SELECT 1 
    FROM public.group_memberships gm 
    WHERE gm.user_id = complaints.user_id 
    AND gm.group_id = complaints.group_id 
    AND gm.status = 'active'
  );

-- 3. RECRIAR FUNÇÃO DE CANCELAMENTO COM FECHAMENTO DE RECLAMAÇÕES
-- =====================================================

CREATE OR REPLACE FUNCTION process_cancellation(
  p_user_id UUID,
  p_group_id UUID,
  p_reason TEXT DEFAULT '',
  p_description TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
  membership_record RECORD;
  complaint_ids UUID[];
BEGIN
  -- Buscar o membership ativo
  SELECT * INTO membership_record
  FROM public.group_memberships
  WHERE group_id = p_group_id 
    AND user_id = p_user_id 
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Membro não encontrado ou já saiu do grupo'
    );
  END IF;

  -- Marcar como saído
  UPDATE public.group_memberships
  SET 
    status = 'left',
    left_at = NOW()
  WHERE id = membership_record.id;

  -- FECHAR TODAS AS RECLAMAÇÕES ABERTAS DO USUÁRIO PARA ESTE GRUPO
  UPDATE public.complaints 
  SET 
    status = 'closed',
    resolved_at = NOW(),
    updated_at = NOW()
  WHERE 
    user_id = p_user_id 
    AND group_id = p_group_id
    AND status IN ('pending', 'admin_responded', 'user_responded')
  RETURNING id INTO complaint_ids;

  -- Adicionar mensagem de sistema nas reclamações fechadas
  IF array_length(complaint_ids, 1) > 0 THEN
    INSERT INTO public.complaint_messages (
      complaint_id,
      user_id,
      message_type,
      message
    )
    SELECT 
      unnest(complaint_ids),
      'e7add840-d677-4b32-8265-297817a47b47', -- Admin system user
      'system_message',
      'Reclamação fechada automaticamente - Usuário cancelou participação no grupo';
  END IF;

  -- RECALCULAR contador de membros do grupo (não apenas decrementar)
  UPDATE public.groups
  SET current_members = (
    SELECT COUNT(*)
    FROM public.group_memberships gm
    WHERE gm.group_id = p_group_id
    AND gm.status = 'active'
  )
  WHERE id = p_group_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Saiu do grupo com sucesso',
    'complaints_closed', array_length(complaint_ids, 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RECRIAR FUNÇÃO DE ENTRADA NO GRUPO COM RECÁLCULO CORRETO
-- =====================================================

CREATE OR REPLACE FUNCTION join_group_with_payment(
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

  -- Verificar se existe um membership anterior (reativação)
  SELECT * INTO existing_membership
  FROM public.group_memberships
  WHERE group_id = group_uuid AND user_id = user_uuid AND status = 'left'
  ORDER BY left_at DESC
  LIMIT 1;

  -- Calcular taxa administrativa (5%)
  admin_fee := ROUND(payment_amount_cents * 0.05);

  -- Verificar saldo suficiente
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

  IF existing_membership.id IS NOT NULL THEN
    -- Reativar membership existente
    UPDATE public.group_memberships
    SET
      status = 'active',
      joined_at = NOW(),
      left_at = NULL,
      paid_amount_cents = payment_amount_cents
    WHERE id = existing_membership.id;

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

  ELSE
    -- Criar novo membership
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
  END IF;

  -- RECALCULAR contador de membros do grupo (não apenas incrementar)
  UPDATE public.groups
  SET current_members = (
    SELECT COUNT(*)
    FROM public.group_memberships gm
    WHERE gm.group_id = group_uuid
    AND gm.status = 'active'
  )
  WHERE id = group_uuid;

  RETURN json_build_object(
    'success', true,
    'transaction_id', currval('transactions_id_seq'),
    'membership_reactivated', existing_membership.id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CRIAR TRIGGER PARA RECALCULAR CONTADOR AUTOMATICAMENTE
-- =====================================================

-- Função para recalcular contador de membros
CREATE OR REPLACE FUNCTION recalculate_group_members_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Sempre recalcular o contador baseado nos membros ativos
  UPDATE public.groups
  SET current_members = (
    SELECT COUNT(*)
    FROM public.group_memberships gm
    WHERE gm.group_id = COALESCE(NEW.group_id, OLD.group_id)
    AND gm.status = 'active'
  )
  WHERE id = COALESCE(NEW.group_id, OLD.group_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_recalculate_group_members ON public.group_memberships;

-- Criar novo trigger
CREATE TRIGGER trigger_recalculate_group_members
  AFTER INSERT OR UPDATE OR DELETE ON public.group_memberships
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_group_members_count();

-- 6. CRIAR TRIGGER PARA FECHAR RECLAMAÇÕES AUTOMATICAMENTE
-- =====================================================

-- Função para fechar reclamações quando usuário sai do grupo
CREATE OR REPLACE FUNCTION close_complaints_on_leave()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o status mudou para 'left', fechar reclamações abertas
  IF NEW.status = 'left' AND OLD.status = 'active' THEN
    -- Fechar reclamações abertas
    UPDATE public.complaints
    SET
      status = 'closed',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE
      user_id = NEW.user_id
      AND group_id = NEW.group_id
      AND status IN ('pending', 'admin_responded', 'user_responded');

    -- Adicionar mensagem de sistema
    INSERT INTO public.complaint_messages (
      complaint_id,
      user_id,
      message_type,
      message
    )
    SELECT
      c.id,
      'e7add840-d677-4b32-8265-297817a47b47', -- Admin system user
      'system_message',
      'Reclamação fechada automaticamente - Usuário cancelou participação no grupo'
    FROM public.complaints c
    WHERE
      c.user_id = NEW.user_id
      AND c.group_id = NEW.group_id
      AND c.status = 'closed'
      AND c.resolved_at >= NOW() - INTERVAL '1 minute';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_close_complaints_on_leave ON public.group_memberships;

-- Criar novo trigger
CREATE TRIGGER trigger_close_complaints_on_leave
  AFTER UPDATE ON public.group_memberships
  FOR EACH ROW
  WHEN (NEW.status = 'left' AND OLD.status = 'active')
  EXECUTE FUNCTION close_complaints_on_leave();

-- 7. EXECUTAR CORREÇÕES FINAIS
-- =====================================================

-- Adicionar mensagens de sistema para reclamações já fechadas
INSERT INTO public.complaint_messages (
  complaint_id,
  user_id,
  message_type,
  message
)
SELECT
  c.id,
  'e7add840-d677-4b32-8265-297817a47b47', -- Admin system user
  'system_message',
  'Reclamação fechada automaticamente - Usuário cancelou participação no grupo'
FROM public.complaints c
WHERE
  c.status = 'closed'
  AND c.resolved_at >= NOW() - INTERVAL '1 hour'
  AND NOT EXISTS (
    SELECT 1
    FROM public.complaint_messages cm
    WHERE cm.complaint_id = c.id
    AND cm.message_type = 'system_message'
    AND cm.message LIKE '%cancelou participação%'
  );

SELECT 'Correção definitiva do sistema concluída!' as status;
