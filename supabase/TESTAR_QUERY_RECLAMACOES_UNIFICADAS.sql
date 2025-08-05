-- Testar a query das reclamações unificadas
-- Substitua o UUID abaixo pelo ID do usuário logado

-- Teste 1: Buscar reclamações onde o usuário é cliente OU admin
SELECT 
    c.id,
    c.problem_type,
    c.problem_description,
    c.desired_solution,
    c.status,
    c.created_at,
    c.admin_response_deadline,
    c.intervention_deadline,
    c.user_id,
    c.admin_id,
    g.name as group_name,
    p.full_name as user_name
FROM public.complaints c
JOIN public.groups g ON c.group_id = g.id
JOIN public.profiles p ON c.user_id = p.user_id
WHERE c.user_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' 
   OR c.admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7'
ORDER BY c.created_at DESC;

-- Teste 2: Verificar se existem reclamações para este usuário
SELECT 
    COUNT(*) as total_reclamacoes,
    COUNT(CASE WHEN user_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' THEN 1 END) as como_cliente,
    COUNT(CASE WHEN admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' THEN 1 END) as como_admin
FROM public.complaints
WHERE user_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' 
   OR admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7';

-- Teste 3: Verificar estrutura da tabela complaints
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaints'
ORDER BY ordinal_position; 