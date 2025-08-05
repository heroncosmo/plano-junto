-- Verificar reclamações para o usuário específico
-- UUID do usuário: 613815c9-7fba-4fb7-8b66-97cd2396aaf7

-- 1. Verificar se existem reclamações onde o usuário é cliente
SELECT 
    COUNT(*) as total_como_cliente,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendentes_como_cliente
FROM public.complaints 
WHERE user_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7';

-- 2. Verificar se existem reclamações onde o usuário é admin
SELECT 
    COUNT(*) as total_como_admin,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendentes_como_admin
FROM public.complaints 
WHERE admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7';

-- 3. Verificar todas as reclamações (como cliente OU admin)
SELECT 
    COUNT(*) as total_reclamacoes,
    COUNT(CASE WHEN user_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' THEN 1 END) as como_cliente,
    COUNT(CASE WHEN admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' THEN 1 END) as como_admin
FROM public.complaints
WHERE user_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' 
   OR admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7';

-- 4. Verificar algumas reclamações de exemplo
SELECT 
    c.id,
    c.status,
    c.problem_type,
    c.created_at,
    g.name as group_name,
    CASE 
        WHEN c.user_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' THEN 'Cliente'
        WHEN c.admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' THEN 'Admin'
    END as role
FROM public.complaints c
JOIN public.groups g ON c.group_id = g.id
WHERE c.user_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7' 
   OR c.admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7'
ORDER BY c.created_at DESC
LIMIT 5; 