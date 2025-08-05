-- Atualizar admin_id das reclamações existentes
-- Baseado no criador do grupo (assumindo que o criador do grupo é o admin)

-- Primeiro, verificar quais grupos têm criador
SELECT 
    g.id as group_id,
    g.name as group_name,
    g.created_by,
    p.full_name as creator_name
FROM public.groups g
LEFT JOIN public.profiles p ON g.created_by = p.user_id
WHERE g.created_by IS NOT NULL;

-- Atualizar reclamações com admin_id baseado no criador do grupo
UPDATE public.complaints 
SET admin_id = g.created_by
FROM public.groups g
WHERE complaints.group_id = g.id 
AND complaints.admin_id IS NULL
AND g.created_by IS NOT NULL;

-- Verificar resultado da atualização
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