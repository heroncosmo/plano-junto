-- Verificar estrutura completa do sistema de reclamações

-- 1. Verificar tabela complaints
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaints'
ORDER BY ordinal_position;

-- 2. Verificar tabela complaint_messages
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaint_messages'
ORDER BY ordinal_position;

-- 3. Verificar grupos onde o usuário é admin
SELECT 
    g.id,
    g.name,
    g.created_by,
    g.created_at,
    p.full_name as admin_name
FROM public.groups g
JOIN public.profiles p ON g.created_by = p.user_id
WHERE g.created_by = auth.uid();

-- 4. Verificar reclamações dos grupos onde o usuário é admin
SELECT 
    c.id,
    c.status,
    c.problem_type,
    c.problem_description,
    c.desired_solution,
    c.created_at,
    c.admin_response_deadline,
    c.intervention_deadline,
    g.name as group_name,
    p.full_name as user_name
FROM public.complaints c
JOIN public.groups g ON c.group_id = g.id
JOIN public.profiles p ON c.user_id = p.user_id
WHERE g.created_by = auth.uid()
ORDER BY c.created_at DESC;

-- 5. Verificar políticas RLS na tabela complaints
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'complaints';

-- 6. Verificar se existe view para reclamações de admin
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%complaint%'
AND table_name LIKE '%admin%'; 