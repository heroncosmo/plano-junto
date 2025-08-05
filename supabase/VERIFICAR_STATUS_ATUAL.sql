-- Verificar status atual da reclamação
SELECT 
    id,
    status,
    closed_at,
    updated_at,
    created_at
FROM public.complaints
WHERE id = 'e7f9cad5-02a8-47e0-826a-303ae0724040'; 