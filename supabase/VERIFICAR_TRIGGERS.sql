-- Verificar triggers na tabela complaints
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'complaints'
AND trigger_schema = 'public'; 