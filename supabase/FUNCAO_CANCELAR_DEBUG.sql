-- Função para cancelar reclamação com debug
CREATE OR REPLACE FUNCTION cancel_complaint_debug(
    p_complaint_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_complaint RECORD;
    v_updated_count INTEGER;
BEGIN
    -- Log inicial
    RAISE NOTICE 'Iniciando cancelamento da reclamação: %', p_complaint_id;
    
    -- Buscar dados da reclamação
    SELECT * INTO v_complaint 
    FROM public.complaints 
    WHERE id = p_complaint_id;
    
    IF v_complaint IS NULL THEN
        RAISE NOTICE 'Reclamação não encontrada: %', p_complaint_id;
        RETURN json_build_object(
            'success', false,
            'error', 'Reclamação não encontrada'
        );
    END IF;
    
    RAISE NOTICE 'Reclamação encontrada - Status atual: %, User ID: %', v_complaint.status, v_complaint.user_id;
    
    -- Verificar se o usuário é o dono da reclamação
    IF v_complaint.user_id != p_user_id THEN
        RAISE NOTICE 'Usuário não tem permissão - User ID: %, Complaint User ID: %', p_user_id, v_complaint.user_id;
        RETURN json_build_object(
            'success', false,
            'error', 'Usuário não tem permissão para cancelar esta reclamação'
        );
    END IF;
    
    -- Verificar se a reclamação pode ser cancelada
    IF v_complaint.status IN ('resolved', 'closed') THEN
        RAISE NOTICE 'Reclamação já finalizada - Status: %', v_complaint.status;
        RETURN json_build_object(
            'success', false,
            'error', 'Reclamação já foi finalizada'
        );
    END IF;
    
    RAISE NOTICE 'Atualizando status para closed...';
    
    -- Atualizar status e closed_at
    UPDATE public.complaints 
    SET status = 'closed',
        closed_at = NOW()
    WHERE id = p_complaint_id;
    
    -- Verificar se a atualização funcionou
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RAISE NOTICE 'Linhas atualizadas: %', v_updated_count;
    
    IF v_updated_count = 0 THEN
        RAISE NOTICE 'Nenhuma linha foi atualizada!';
        RETURN json_build_object(
            'success', false,
            'error', 'Falha ao atualizar status da reclamação'
        );
    END IF;
    
    RAISE NOTICE 'Status atualizado com sucesso. Adicionando mensagem...';
    
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
    
    RAISE NOTICE 'Mensagem adicionada com sucesso. Cancelamento concluído.';
    
    RETURN json_build_object(
        'success', true,
        'message', 'Reclamação cancelada com sucesso',
        'updated_rows', v_updated_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 