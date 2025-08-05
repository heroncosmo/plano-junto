-- Corrigir admin_id das reclamações baseado no admin_id do grupo
-- Esta é a forma correta de associar reclamações aos administradores

-- Verificar grupos e seus admins
SELECT 
    g.id as group_id,
    g.name as group_name,
    g.admin_id,
    p.full_name as admin_name
FROM public.groups g
LEFT JOIN public.profiles p ON g.admin_id = p.user_id
WHERE g.admin_id IS NOT NULL
ORDER BY g.name;

-- Atualizar reclamações com admin_id baseado no admin_id do grupo
UPDATE public.complaints 
SET admin_id = g.admin_id
FROM public.groups g
WHERE complaints.group_id = g.id 
AND complaints.admin_id IS NULL
AND g.admin_id IS NOT NULL;

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