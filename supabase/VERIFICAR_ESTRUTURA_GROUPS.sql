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

-- Verificar dados da tabela groups
SELECT 
    id,
    name,
    created_at,
    *
FROM public.groups
LIMIT 5;

-- Verificar se existe coluna para admin/owner
SELECT 
    column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'groups'
AND column_name LIKE '%admin%' OR column_name LIKE '%owner%' OR column_name LIKE '%user%'; 