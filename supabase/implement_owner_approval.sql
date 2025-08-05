-- =====================================================
-- IMPLEMENTAÇÃO DO FLUXO DE LIBERAÇÃO PELO DONO DO GRUPO
-- Execute este SQL no Supabase para implementar a funcionalidade
-- =====================================================

-- 1. Adicionar campo owner_approved na tabela groups
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS owner_approved BOOLEAN DEFAULT false;

-- Comentário para o campo
COMMENT ON COLUMN public.groups.owner_approved IS 'Indica se o dono do grupo aprovou/liberou o grupo após aprovação do admin';

-- 2. Atualizar grupos existentes que já estão aprovados pelo admin
-- (para não quebrar grupos existentes)
UPDATE public.groups 
SET owner_approved = true 
WHERE admin_approved = true AND status = 'active_with_slots';

-- 3. Atualizar a view groups_detailed para incluir o novo campo
DROP VIEW IF EXISTS groups_detailed;

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

-- 4. Criar função para liberar grupo pelo dono
CREATE OR REPLACE FUNCTION approve_group_by_owner(
  group_uuid UUID,
  user_uuid UUID
)
RETURNS JSON AS $$
DECLARE
  group_data RECORD;
BEGIN
  -- Verificar se o grupo existe e se o usuário é o admin
  SELECT * INTO group_data 
  FROM public.groups 
  WHERE id = group_uuid AND admin_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Grupo não encontrado ou você não tem permissão'
    );
  END IF;
  
  -- Verificar se o grupo foi aprovado pelo admin
  IF NOT group_data.admin_approved THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Grupo ainda não foi aprovado pelo administrador'
    );
  END IF;
  
  -- Verificar se já foi liberado pelo dono
  IF group_data.owner_approved THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Grupo já foi liberado'
    );
  END IF;
  
  -- Liberar o grupo
  UPDATE public.groups 
  SET 
    owner_approved = true,
    status = 'active_with_slots',
    updated_at = now()
  WHERE id = group_uuid;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Grupo liberado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Atualizar políticas RLS para considerar owner_approved
DROP POLICY IF EXISTS "Users can view all active groups" ON public.groups;

CREATE POLICY "Users can view all active groups" ON public.groups
  FOR SELECT USING (
    (admin_approved = true AND owner_approved = true) OR
    admin_id = auth.uid()
  );

-- 6. Atualizar função de criação de grupos para definir owner_approved = false
CREATE OR REPLACE FUNCTION create_group_with_approval(
  service_uuid UUID,
  group_name TEXT,
  group_description TEXT,
  group_rules TEXT,
  relationship_type_param TEXT,
  max_members_param INTEGER,
  price_per_slot_cents_param INTEGER,
  instant_access_param BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  new_group_id UUID;
  user_uuid UUID;
BEGIN
  -- Obter o ID do usuário autenticado
  user_uuid := auth.uid();

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Inserir o novo grupo
  INSERT INTO public.groups (
    admin_id,
    service_id,
    name,
    description,
    rules,
    relationship_type,
    max_members,
    price_per_slot_cents,
    instant_access,
    admin_approved,
    owner_approved,
    status,
    current_members
  ) VALUES (
    user_uuid,
    service_uuid,
    group_name,
    group_description,
    group_rules,
    relationship_type_param,
    max_members_param,
    price_per_slot_cents_param,
    instant_access_param,
    true, -- admin_approved = true (serviços pré-aprovados)
    false, -- owner_approved = false (dono precisa liberar)
    'waiting_subscription', -- status inicial
    0 -- current_members = 0
  ) RETURNING id INTO new_group_id;

  RETURN new_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAÇÃO
-- Execute estas queries para verificar se tudo funcionou:
-- =====================================================

-- Verificar se o campo foi adicionado
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'groups' AND column_name = 'owner_approved';

-- Verificar grupos que precisam ser liberados pelo dono
-- SELECT id, name, admin_approved, owner_approved, status 
-- FROM public.groups 
-- WHERE admin_approved = true AND owner_approved = false;

-- Verificar se a função foi criada
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_name = 'approve_group_by_owner';
