# 🚀 EXECUTE ESTE SQL AGORA NO SUPABASE

## 📋 INSTRUÇÕES RÁPIDAS:

1. **Abri o Supabase SQL Editor para você** (deve estar aberto no navegador)
2. **Cole TODO o SQL abaixo** no editor
3. **Clique em "Run"** para executar
4. **Aguarde a confirmação** de sucesso

---

## 📝 SQL PARA EXECUTAR:

```sql
-- =====================================================
-- IMPLEMENTAÇÃO COMPLETA DO FLUXO DE LIBERAÇÃO PELO DONO DO GRUPO
-- Execute este SQL no Supabase para implementar a funcionalidade completa
-- =====================================================

-- 1. Adicionar campo owner_approved na tabela groups (se não existir)
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

-- 6. Função para criar grupos com aprovação do dono
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
-- VERIFICAÇÃO - Execute para confirmar que funcionou
-- =====================================================

-- Verificar se o campo foi adicionado
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'groups' AND column_name = 'owner_approved';

-- Verificar se a função foi criada
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'approve_group_by_owner';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'groups';
```

---

## ✅ APÓS EXECUTAR:

1. **Verifique se não houve erros** no SQL Editor
2. **Confirme que as verificações** no final retornaram dados
3. **A funcionalidade estará 100% implementada!**

## 🎯 O QUE SERÁ IMPLEMENTADO:

- ✅ Campo `owner_approved` na tabela `groups`
- ✅ Função `approve_group_by_owner` para liberação
- ✅ Políticas RLS atualizadas
- ✅ View `groups_detailed` atualizada
- ✅ Grupos existentes mantidos funcionais
- ✅ Novos grupos criados com `owner_approved = false`

## 🚀 RESULTADO:

Após executar este SQL, o fluxo completo estará funcionando:
1. **Criar grupo** → `owner_approved = false`
2. **Acessar "Meus Grupos"** → Botão "Gerenciar"
3. **Página de liberação** → Checkboxes + "Liberar grupo"
4. **Grupo liberado** → Aparece em listagens públicas

**Execute agora e a funcionalidade estará pronta! 🎉**
