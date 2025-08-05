-- Testar a função get_admin_complaints com um admin real
-- Primeiro, verificar quais usuários são admins de grupos
SELECT DISTINCT 
    g.admin_id,
    p.full_name as admin_name,
    COUNT(g.id) as grupos_administrados
FROM public.groups g
JOIN public.profiles p ON g.admin_id = p.user_id
WHERE g.admin_id IS NOT NULL
GROUP BY g.admin_id, p.full_name
ORDER BY p.full_name;

-- Verificar reclamações de um admin específico
-- Substitua o UUID abaixo por um dos admin_id encontrados acima
SELECT 
    c.id,
    c.status,
    c.problem_type,
    g.name as group_name,
    p.full_name as user_name,
    admin_p.full_name as admin_name
FROM public.complaints c
JOIN public.groups g ON c.group_id = g.id
JOIN public.profiles p ON c.user_id = p.user_id
LEFT JOIN public.profiles admin_p ON c.admin_id = admin_p.user_id
WHERE c.admin_id = '613815c9-7fba-4fb7-8b66-97cd2396aaf7'  -- Rodrigo macedo
ORDER BY c.created_at DESC;

-- Testar a função RPC com o admin Rodrigo macedo
SELECT * FROM get_admin_complaints('613815c9-7fba-4fb7-8b66-97cd2396aaf7');

-- Testar com outro admin (Wendell Costa)
SELECT * FROM get_admin_complaints('54f2830f-4015-4117-9842-b4697ef84172'); 