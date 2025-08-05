-- Testar a função get_admin_complaints
-- Substitua 'SEU_UUID_AQUI' pelo UUID de um usuário que tem reclamações

-- Primeiro, verificar quais usuários têm reclamações como admin
SELECT DISTINCT 
    c.admin_id,
    p.full_name as admin_name
FROM public.complaints c
JOIN public.profiles p ON c.admin_id = p.user_id
WHERE c.admin_id IS NOT NULL
ORDER BY p.full_name;

-- Testar a função com um admin específico
-- Substitua o UUID abaixo por um dos admin_id encontrados acima
SELECT * FROM get_admin_complaints('SEU_UUID_AQUI');

-- Ou testar com o primeiro admin encontrado
SELECT * FROM get_admin_complaints((
    SELECT c.admin_id 
    FROM public.complaints c 
    WHERE c.admin_id IS NOT NULL 
    LIMIT 1
)); 