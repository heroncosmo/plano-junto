-- =====================================================
-- CORREÇÃO FINAL DO SISTEMA - EXECUTE NO SUPABASE
-- =====================================================

-- 1. CORRIGIR CONTADOR DE MEMBROS
-- =====================================================

-- Corrigir o contador de membros para todos os grupos
UPDATE public.groups 
SET current_members = (
  SELECT COUNT(*) 
  FROM public.group_memberships gm 
  WHERE gm.group_id = groups.id 
  AND gm.status = 'active'
);

-- 2. FECHAR RECLAMAÇÕES AUTOMATICAMENTE
-- =====================================================

-- Fechar automaticamente reclamações de usuários que cancelaram participação
UPDATE public.complaints 
SET 
  status = 'closed',
  resolved_at = NOW(),
  updated_at = NOW()
WHERE 
  status IN ('pending', 'admin_responded', 'user_responded')
  AND EXISTS (
    SELECT 1 
    FROM public.group_memberships gm 
    WHERE gm.user_id = complaints.user_id 
    AND gm.group_id = complaints.group_id 
    AND gm.status = 'cancelled'
  );

-- 3. ADICIONAR MENSAGENS DE SISTEMA
-- =====================================================

-- Adicionar mensagens de sistema nas reclamações fechadas automaticamente
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
  AND c.resolved_at = NOW()
  AND EXISTS (
    SELECT 1 
    FROM public.group_memberships gm 
    WHERE gm.user_id = c.user_id 
    AND gm.group_id = c.group_id 
    AND gm.status = 'cancelled'
  );

-- 4. MELHORAR FUNÇÃO DE ATUALIZAÇÃO DO CONTADOR
-- =====================================================

-- Recriar a função de atualização do contador de membros
CREATE OR REPLACE FUNCTION update_group_members_count()
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

-- 5. RECRIAR TRIGGERS
-- =====================================================

-- Remover triggers duplicados
DROP TRIGGER IF EXISTS group_memberships_count_trigger ON public.group_memberships;
DROP TRIGGER IF EXISTS trigger_update_group_members_count ON public.group_memberships;

-- Criar trigger único e correto
CREATE TRIGGER trigger_update_group_members_count
  AFTER INSERT OR UPDATE OR DELETE ON public.group_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_group_members_count();

-- 6. MELHORAR FUNÇÃO DE CANCELAMENTO
-- =====================================================

-- Recriar função de cancelamento para garantir fechamento de reclamações
CREATE OR REPLACE FUNCTION process_cancellation(
  p_user_id UUID,
  p_group_id UUID,
  p_reason TEXT,
  p_description TEXT DEFAULT ''
)
RETURNS UUID AS $$
DECLARE
  v_cancellation_id UUID;
  v_membership_id UUID;
BEGIN
  -- Buscar membership ativo
  SELECT id INTO v_membership_id
  FROM public.group_memberships
  WHERE user_id = p_user_id 
  AND group_id = p_group_id 
  AND status = 'active'
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não é membro ativo deste grupo';
  END IF;
  
  -- Criar registro de cancelamento
  INSERT INTO public.cancellations (
    user_id,
    group_id,
    membership_id,
    reason,
    refund_amount_cents,
    processing_fee_cents,
    final_refund_cents,
    restriction_days,
    restriction_until
  ) VALUES (
    p_user_id,
    p_group_id,
    v_membership_id,
    p_reason,
    0, -- refund_amount_cents
    0, -- processing_fee_cents
    0, -- final_refund_cents
    15, -- restriction_days
    NOW() + INTERVAL '15 days' -- restriction_until
  ) RETURNING id INTO v_cancellation_id;
  
  -- Atualizar status do membership
  UPDATE public.group_memberships 
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = p_reason
  WHERE id = v_membership_id;
  
  -- FECHAR RECLAMAÇÕES AUTOMATICAMENTE
  UPDATE public.complaints 
  SET 
    status = 'closed',
    resolved_at = NOW(),
    updated_at = NOW()
  WHERE 
    user_id = p_user_id 
    AND group_id = p_group_id
    AND status IN ('pending', 'admin_responded', 'user_responded');
  
  -- Adicionar mensagem de sistema nas reclamações fechadas
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
    c.user_id = p_user_id 
    AND c.group_id = p_group_id 
    AND c.status = 'closed'
    AND c.resolved_at = NOW();
  
  -- Criar restrição de usuário
  INSERT INTO public.user_restrictions (
    user_id,
    reason,
    restriction_type,
    restriction_until
  ) VALUES (
    p_user_id,
    'Cancelamento de grupo',
    'group_participation',
    NOW() + INTERVAL '15 days'
  );
  
  RETURN v_cancellation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. SINCRONIZAR TODOS OS CONTADORES
-- =====================================================

-- Executar sincronização manual
UPDATE public.groups g
SET current_members = (
  SELECT COUNT(*)
  FROM public.group_memberships gm
  WHERE gm.group_id = g.id AND gm.status = 'active'
);

-- 8. VERIFICAR RESULTADOS
-- =====================================================

-- Verificar grupos com contadores corrigidos
SELECT 
  g.id, 
  g.name, 
  g.current_members, 
  g.max_members, 
  COUNT(gm.id) as actual_members,
  COUNT(CASE WHEN gm.status = 'active' THEN 1 END) as active_members
FROM groups g 
LEFT JOIN group_memberships gm ON g.id = gm.group_id 
GROUP BY g.id, g.name, g.current_members, g.max_members 
ORDER BY g.current_members DESC 
LIMIT 10;

-- Verificar reclamações fechadas
SELECT 
  c.id, 
  c.status, 
  c.user_id, 
  c.group_id, 
  gm.status as membership_status,
  p.full_name 
FROM complaints c 
LEFT JOIN group_memberships gm ON c.user_id = gm.user_id AND c.group_id = gm.group_id 
LEFT JOIN profiles p ON c.user_id = p.user_id 
WHERE c.status IN ('pending', 'admin_responded', 'user_responded') 
ORDER BY c.created_at DESC 
LIMIT 5;
