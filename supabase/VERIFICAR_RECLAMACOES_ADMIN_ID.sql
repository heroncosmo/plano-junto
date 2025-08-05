-- Verificar reclamações que têm admin_id preenchido
SELECT 
    c.id,
    c.status,
    c.problem_type,
    c.problem_description,
    c.admin_id,
    c.user_id,
    g.name as group_name,
    p.full_name as user_name,
    admin_p.full_name as admin_name
FROM public.complaints c
JOIN public.groups g ON c.group_id = g.id
JOIN public.profiles p ON c.user_id = p.user_id
LEFT JOIN public.profiles admin_p ON c.admin_id = admin_p.user_id
WHERE c.admin_id IS NOT NULL
ORDER BY c.created_at DESC;

-- Verificar quantas reclamações têm admin_id
SELECT 
    COUNT(*) as total_complaints,
    COUNT(admin_id) as complaints_with_admin,
    COUNT(*) - COUNT(admin_id) as complaints_without_admin
FROM public.complaints;

-- Verificar estrutura da tabela complaints para confirmar admin_id
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaints'
AND column_name = 'admin_id'; 