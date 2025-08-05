-- Verificar status da reclamação específica
SELECT 
    id,
    status,
    closed_at,
    updated_at,
    created_at,
    user_id,
    group_id
FROM public.complaints
WHERE id = 'e7f9cad5-02a8-47e0-826a-303ae0724040';

-- Verificar mensagens de sistema
SELECT 
    id,
    complaint_id,
    message_type,
    message,
    created_at
FROM public.complaint_messages
WHERE complaint_id = 'e7f9cad5-02a8-47e0-826a-303ae0724040'
ORDER BY created_at DESC; 