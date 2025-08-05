-- Função final para cancelar reclamação
CREATE OR REPLACE FUNCTION cancel_complaint_final(
    p_complaint_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_complaint RECORD;
BEGIN
    -- Buscar dados da reclamação
    SELECT * INTO v_complaint 
    FROM public.complaints 
    WHERE id = p_complaint_id;
    
    IF v_complaint IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Reclamação não encontrada'
        );
    END IF;
    
    -- Verificar se o usuário é o dono da reclamação
    IF v_complaint.user_id != p_user_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não tem permissão para cancelar esta reclamação'
        );
    END IF;
    
    -- Verificar se a reclamação pode ser cancelada
    IF v_complaint.status IN ('resolved', 'closed') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Reclamação já foi finalizada'
        );
    END IF;
    
    -- Atualizar status e closed_at
    UPDATE public.complaints 
    SET status = 'closed',
        closed_at = NOW()
    WHERE id = p_complaint_id;
    
    -- Adicionar mensagem de cancelamento
    INSERT INTO public.complaint_messages (
        complaint_id,
        user_id,
        message_type,
        message
    ) VALUES (
        p_complaint_id,
        p_user_id,
        'system_message',
        'Reclamação cancelada pelo usuário'
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Reclamação cancelada com sucesso'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 