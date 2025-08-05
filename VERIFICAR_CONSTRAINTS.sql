-- ===========================================
-- VERIFICAR E CORRIGIR CONSTRAINTS
-- ===========================================

-- 1. VERIFICAR CONSTRAINTS ATUAIS
-- ===========================================
SELECT 
    'Constraints da tabela group_memberships' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'group_memberships'
ORDER BY constraint_type;

-- 2. VERIFICAR CONSTRAINT ÚNICA ESPECÍFICA
-- ===========================================
SELECT 
    'Constraint única group_id + user_id' as info,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'group_memberships' 
AND constraint_type = 'UNIQUE'
AND constraint_name LIKE '%group_id%';

-- 3. VERIFICAR SE A CONSTRAINT ESTÁ IMPEDINDO REATIVAÇÃO
-- ===========================================
-- Esta constraint deve permitir múltiplos registros com status diferente
-- Por exemplo: um 'cancelled' e um 'active' para o mesmo group_id + user_id

-- 4. REMOVER CONSTRAINT PROBLEMÁTICA (se existir)
-- ===========================================
-- ALTER TABLE public.group_memberships 
-- DROP CONSTRAINT IF EXISTS group_memberships_group_id_user_id_key;

-- 5. CRIAR NOVA CONSTRAINT MAIS FLEXÍVEL
-- ===========================================
-- Permitir apenas um membership ativo por usuário por grupo
-- ALTER TABLE public.group_memberships 
-- ADD CONSTRAINT group_memberships_active_unique 
-- UNIQUE (group_id, user_id, status) 
-- WHERE status = 'active';

-- 6. VERIFICAR DADOS ATUAIS
-- ===========================================
SELECT 
    'Status dos memberships' as info,
    status,
    COUNT(*) as total
FROM public.group_memberships
GROUP BY status
ORDER BY status;

-- 7. VERIFICAR DUPLICATAS PROBLEMÁTICAS
-- ===========================================
SELECT 
    'Possíveis duplicatas problemáticas' as info,
    group_id,
    user_id,
    COUNT(*) as total_registros,
    array_agg(status) as status_list
FROM public.group_memberships
GROUP BY group_id, user_id
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 8. SUGESTÃO DE CORREÇÃO
-- ===========================================
-- Se houver duplicatas, manter apenas o mais recente ou o ativo
-- DELETE FROM public.group_memberships 
-- WHERE id IN (
--   SELECT gm1.id
--   FROM public.group_memberships gm1
--   INNER JOIN public.group_memberships gm2 
--   ON gm1.group_id = gm2.group_id 
--   AND gm1.user_id = gm2.user_id 
--   AND gm1.id < gm2.id
-- ); 