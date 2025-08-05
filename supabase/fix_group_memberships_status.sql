-- ========================================
-- CORREÇÃO: Adicionar Status aos Group Memberships
-- ========================================

-- 1. ADICIONAR CAMPO STATUS À TABELA
-- ===================================

-- Adicionar campo status à tabela group_memberships
ALTER TABLE public.group_memberships 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Adicionar campo left_at para registrar quando saiu
ALTER TABLE public.group_memberships 
ADD COLUMN IF NOT EXISTS left_at TIMESTAMPTZ;

-- 2. CORRIGIR DADOS EXISTENTES
-- =============================

-- Marcar como 'left' os membros duplicados (manter apenas o mais recente)
WITH ranked_memberships AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (
      PARTITION BY group_id, user_id 
      ORDER BY joined_at DESC
    ) as rn
  FROM public.group_memberships
)
UPDATE public.group_memberships 
SET 
  status = CASE 
    WHEN gm.rn = 1 THEN 'active'
    ELSE 'left'
  END,
  left_at = CASE 
    WHEN gm.rn > 1 THEN gm.joined_at
    ELSE NULL
  END
FROM ranked_memberships gm
WHERE public.group_memberships.id = gm.id;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ==================================

-- Índice para buscar membros ativos
CREATE INDEX IF NOT EXISTS idx_group_memberships_status 
ON public.group_memberships(status) 
WHERE status = 'active';

-- Índice para buscar por grupo e usuário
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_user 
ON public.group_memberships(group_id, user_id, status);

-- 4. ATUALIZAR FUNÇÕES EXISTENTES
-- =================================

-- Função para sair de um grupo
CREATE OR REPLACE FUNCTION leave_group(
  group_uuid UUID,
  user_uuid UUID
)
RETURNS JSON AS $$
DECLARE
  membership_record RECORD;
BEGIN
  -- Buscar o membership ativo
  SELECT * INTO membership_record
  FROM public.group_memberships
  WHERE group_id = group_uuid 
    AND user_id = user_uuid 
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

  -- Decrementar contador de membros do grupo
  UPDATE public.groups
  SET current_members = GREATEST(current_members - 1, 0)
  WHERE id = group_uuid;

  RETURN json_build_object(
    'success', true,
    'message', 'Saiu do grupo com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ATUALIZAR POLÍTICAS RLS
-- ============================

-- Política para visualizar apenas membros ativos
DROP POLICY IF EXISTS "Users can view active memberships" ON public.group_memberships;
CREATE POLICY "Users can view active memberships" ON public.group_memberships
  FOR SELECT USING (
    (user_id = auth.uid() OR 
     EXISTS(SELECT 1 FROM public.groups WHERE id = group_id AND admin_id = auth.uid()))
    AND status = 'active'
  );

-- Política para admin ver todos os membros (incluindo inativos)
DROP POLICY IF EXISTS "Admin can view all memberships" ON public.group_memberships;
CREATE POLICY "Admin can view all memberships" ON public.group_memberships
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'calcadosdrielle@gmail.com'
    OR (user_id = auth.uid() AND status = 'active')
    OR EXISTS(SELECT 1 FROM public.groups WHERE id = group_id AND admin_id = auth.uid())
  );

-- 6. VERIFICAÇÃO DOS DADOS
-- =========================

-- Verificar quantos membros ativos temos
SELECT 
  'Membros ativos' as tipo,
  COUNT(*) as total
FROM public.group_memberships 
WHERE status = 'active'

UNION ALL

SELECT 
  'Membros que saíram' as tipo,
  COUNT(*) as total
FROM public.group_memberships 
WHERE status = 'left'

UNION ALL

SELECT 
  'Total de registros' as tipo,
  COUNT(*) as total
FROM public.group_memberships;

-- Verificar se há duplicatas por grupo/usuário
SELECT 
  group_id,
  user_id,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as ativos,
  COUNT(CASE WHEN status = 'left' THEN 1 END) as sairam
FROM public.group_memberships
GROUP BY group_id, user_id
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 7. VIEW PARA MEMBROS ATIVOS
-- ============================

-- Criar view para membros ativos
CREATE OR REPLACE VIEW active_group_memberships AS
SELECT 
  gm.*,
  g.name as group_name,
  g.status as group_status,
  s.name as service_name,
  s.icon_url as service_icon,
  p.full_name as member_name
FROM public.group_memberships gm
JOIN public.groups g ON gm.group_id = g.id
JOIN public.services s ON g.service_id = s.id
JOIN public.profiles p ON gm.user_id = p.user_id
WHERE gm.status = 'active';

SELECT 'Correção de group_memberships concluída!' as status; 