-- Primeiro, dropar a função existente
DROP FUNCTION IF EXISTS get_admin_complaints(uuid);

-- Função para buscar reclamações dos grupos onde o usuário é admin
-- Versão final usando admin_id
CREATE OR REPLACE FUNCTION get_admin_complaints(admin_uuid UUID)
RETURNS TABLE (
    id UUID,
    group_name TEXT,
    service_name TEXT,
    problem_type TEXT,
    problem_description TEXT,
    desired_solution TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    message_count BIGINT,
    admin_response_deadline TIMESTAMPTZ,
    intervention_deadline TIMESTAMPTZ,
    user_name TEXT,
    user_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        g.name as group_name,
        g.name as service_name, -- Usando nome do grupo como serviço
        c.problem_type,
        c.problem_description,
        c.desired_solution,
        c.status,
        c.created_at,
        COALESCE(msg_count.count, 0) as message_count,
        c.admin_response_deadline,
        c.intervention_deadline,
        p.full_name as user_name,
        c.user_id
    FROM public.complaints c
    JOIN public.groups g ON c.group_id = g.id
    JOIN public.profiles p ON c.user_id = p.user_id
    LEFT JOIN (
        SELECT 
            complaint_id,
            COUNT(*) as count
        FROM public.complaint_messages
        GROUP BY complaint_id
    ) msg_count ON c.id = msg_count.complaint_id
    WHERE c.admin_id = admin_uuid  -- Filtrar por admin_id
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 