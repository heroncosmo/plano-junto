-- ===========================================
-- VERIFICAR TABELA COMPLAINTS
-- ===========================================

-- Verificar se a tabela complaints existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'complaints';

-- Se existir, ver sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaints'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_complaints
FROM public.complaints;

-- Verificar algumas reclamações
SELECT id, user_id, group_id, status, created_at
FROM public.complaints
LIMIT 5; 