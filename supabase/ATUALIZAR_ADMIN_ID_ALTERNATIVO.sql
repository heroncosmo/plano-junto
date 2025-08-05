-- Alternativa: Atualizar admin_id das reclamações existentes
-- Se não existir created_by na tabela groups, usar uma abordagem diferente

-- Verificar estrutura da tabela groups
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'groups'
ORDER BY ordinal_position;

-- Se não existir created_by, podemos:
-- 1. Usar o primeiro usuário que criou uma reclamação no grupo como admin
-- 2. Ou definir um admin padrão

-- Opção 1: Usar o primeiro usuário que criou reclamação no grupo como admin
UPDATE public.complaints 
SET admin_id = (
    SELECT c2.user_id 
    FROM public.complaints c2 
    WHERE c2.group_id = complaints.group_id 
    ORDER BY c2.created_at ASC 
    LIMIT 1
)
WHERE complaints.admin_id IS NULL;

-- Verificar resultado
SELECT 
    COUNT(*) as total_complaints,
    COUNT(admin_id) as complaints_with_admin,
    COUNT(*) - COUNT(admin_id) as complaints_without_admin
FROM public.complaints;

-- Verificar algumas reclamações atualizadas
SELECT 
    c.id,
    c.status,
    c.problem_type,
    c.admin_id,
    g.name as group_name,
    p.full_name as user_name,
    admin_p.full_name as admin_name
FROM public.complaints c
JOIN public.groups g ON c.group_id = g.id
JOIN public.profiles p ON c.user_id = p.user_id
LEFT JOIN public.profiles admin_p ON c.admin_id = admin_p.user_id
WHERE c.admin_id IS NOT NULL
ORDER BY c.created_at DESC
LIMIT 5; 