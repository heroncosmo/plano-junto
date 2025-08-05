-- ===========================================
-- SISTEMA DE RECLAMAÇÕES - PLANO JUNTO
-- Baseado no fluxo do Kotas
-- ===========================================

-- 1. TABELAS PRINCIPAIS
-- ===========================================

-- Tabela de reclamações
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    
    -- Motivo da reclamação
    problem_type TEXT NOT NULL CHECK (problem_type IN (
        'subscription_stopped',
        'service_different_description', 
        'admin_payment_outside_site',
        'other'
    )),
    problem_description TEXT,
    
    -- Solução desejada
    desired_solution TEXT NOT NULL CHECK (desired_solution IN (
        'problem_solution',
        'problem_solution_and_refund',
        'subscription_cancellation_and_refund'
    )),
    
    -- Status da reclamação
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending',           -- Aguardando resposta do admin
        'admin_responded',   -- Admin respondeu
        'user_responded',    -- Usuário respondeu
        'intervention',      -- JuntaPlay intervindo
        'resolved',          -- Resolvido
        'closed'             -- Fechado
    )),
    
    -- Datas importantes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_response_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    intervention_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Informações adicionais
    user_contacted_admin BOOLEAN DEFAULT FALSE,
    admin_contacted_user BOOLEAN DEFAULT FALSE,
    
    -- RLS
    CONSTRAINT complaints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    CONSTRAINT complaints_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
    CONSTRAINT complaints_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Tabela de mensagens/conversas da reclamação
CREATE TABLE IF NOT EXISTS public.complaint_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    
    -- Tipo de mensagem
    message_type TEXT NOT NULL CHECK (message_type IN (
        'opening',           -- Abertura da reclamação
        'user_message',      -- Mensagem do usuário
        'admin_message',     -- Mensagem do admin
        'system_message',    -- Mensagem do sistema
        'intervention'       -- Intervenção da JuntaPlay
    )),
    
    -- Conteúdo
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_public BOOLEAN DEFAULT TRUE, -- Se a mensagem é visível para ambas as partes
    
    -- RLS
    CONSTRAINT complaint_messages_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE,
    CONSTRAINT complaint_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Tabela de evidências anexadas
CREATE TABLE IF NOT EXISTS public.complaint_evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    
    -- Tipo de evidência
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'screenshot',
        'document',
        'conversation',
        'payment_proof',
        'other'
    )),
    
    -- Dados da evidência
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    file_size INTEGER,
    file_type TEXT,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- RLS
    CONSTRAINT complaint_evidence_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE,
    CONSTRAINT complaint_evidence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- 2. ÍNDICES PARA PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_group_id ON public.complaints(group_id);
CREATE INDEX IF NOT EXISTS idx_complaints_admin_id ON public.complaints(admin_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at);

CREATE INDEX IF NOT EXISTS idx_complaint_messages_complaint_id ON public.complaint_messages(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_messages_user_id ON public.complaint_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_complaint_messages_created_at ON public.complaint_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_complaint_evidence_complaint_id ON public.complaint_evidence(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_evidence_user_id ON public.complaint_evidence(user_id);

-- 3. FUNÇÕES DE NEGÓCIO
-- ===========================================

-- Função para criar uma nova reclamação
CREATE OR REPLACE FUNCTION create_complaint(
    p_user_id UUID,
    p_group_id UUID,
    p_problem_type TEXT,
    p_problem_description TEXT,
    p_desired_solution TEXT
)
RETURNS JSON AS $$
DECLARE
    v_admin_id UUID;
    v_complaint_id UUID;
    v_result JSON;
BEGIN
    -- Buscar o admin do grupo
    SELECT admin_id INTO v_admin_id 
    FROM public.groups 
    WHERE id = p_group_id;
    
    IF v_admin_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Grupo não encontrado'
        );
    END IF;
    
    -- Verificar se o usuário é membro do grupo
    IF NOT EXISTS (
        SELECT 1 FROM public.group_memberships 
        WHERE user_id = p_user_id AND group_id = p_group_id
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Você não é membro deste grupo'
        );
    END IF;
    
    -- Verificar se já existe uma reclamação ativa
    IF EXISTS (
        SELECT 1 FROM public.complaints 
        WHERE user_id = p_user_id 
        AND group_id = p_group_id 
        AND status IN ('pending', 'admin_responded', 'user_responded', 'intervention')
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Já existe uma reclamação ativa para este grupo'
        );
    END IF;
    
    -- Criar a reclamação
    INSERT INTO public.complaints (
        user_id,
        group_id,
        admin_id,
        problem_type,
        problem_description,
        desired_solution,
        status
    ) VALUES (
        p_user_id,
        p_group_id,
        v_admin_id,
        p_problem_type,
        p_problem_description,
        p_desired_solution,
        'pending'
    ) RETURNING id INTO v_complaint_id;
    
    -- Criar mensagem de abertura
    INSERT INTO public.complaint_messages (
        complaint_id,
        user_id,
        message_type,
        message
    ) VALUES (
        v_complaint_id,
        p_user_id,
        'opening',
        'Reclamação aberta'
    );
    
    RETURN json_build_object(
        'success', true,
        'complaint_id', v_complaint_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar mensagem à reclamação
CREATE OR REPLACE FUNCTION add_complaint_message(
    p_complaint_id UUID,
    p_user_id UUID,
    p_message_type TEXT,
    p_message TEXT,
    p_attachments JSONB DEFAULT '[]'
)
RETURNS JSON AS $$
DECLARE
    v_complaint RECORD;
    v_result JSON;
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
    
    -- Verificar se o usuário tem permissão
    IF p_user_id != v_complaint.user_id AND p_user_id != v_complaint.admin_id THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Sem permissão para adicionar mensagem'
        );
    END IF;
    
    -- Verificar se a reclamação está ativa
    IF v_complaint.status IN ('resolved', 'closed') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Reclamação já foi finalizada'
        );
    END IF;
    
    -- Adicionar mensagem
    INSERT INTO public.complaint_messages (
        complaint_id,
        user_id,
        message_type,
        message,
        attachments
    ) VALUES (
        p_complaint_id,
        p_user_id,
        p_message_type,
        p_message,
        p_attachments
    );
    
    -- Atualizar status da reclamação
    IF p_user_id = v_complaint.admin_id THEN
        UPDATE public.complaints 
        SET status = 'admin_responded',
            admin_contacted_user = TRUE
        WHERE id = p_complaint_id;
    ELSIF p_user_id = v_complaint.user_id THEN
        UPDATE public.complaints 
        SET status = 'user_responded'
        WHERE id = p_complaint_id;
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Mensagem adicionada com sucesso'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para resolver reclamação
CREATE OR REPLACE FUNCTION resolve_complaint(
    p_complaint_id UUID,
    p_resolution_type TEXT,
    p_resolution_details TEXT
)
RETURNS JSON AS $$
DECLARE
    v_complaint RECORD;
    v_result JSON;
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
    
    -- Atualizar status
    UPDATE public.complaints 
    SET status = 'resolved',
        resolved_at = NOW()
    WHERE id = p_complaint_id;
    
    -- Adicionar mensagem de resolução
    INSERT INTO public.complaint_messages (
        complaint_id,
        user_id,
        message_type,
        message
    ) VALUES (
        p_complaint_id,
        v_complaint.admin_id,
        'system_message',
        'Reclamação resolvida: ' || p_resolution_details
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Reclamação resolvida com sucesso'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cancelar reclamação
CREATE OR REPLACE FUNCTION cancel_complaint(
    p_complaint_id UUID,
    p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_complaint RECORD;
    v_result JSON;
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
    
    -- Atualizar status para closed
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

-- Função para iniciar intervenção da JuntaPlay
CREATE OR REPLACE FUNCTION start_intervention(
    p_complaint_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_complaint RECORD;
    v_result JSON;
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
    
    -- Verificar se já passou do prazo de intervenção
    IF NOW() < v_complaint.intervention_deadline THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ainda não é possível iniciar a intervenção'
        );
    END IF;
    
    -- Atualizar status para intervenção
    UPDATE public.complaints 
    SET status = 'intervention'
    WHERE id = p_complaint_id;
    
    -- Adicionar mensagem de intervenção
    INSERT INTO public.complaint_messages (
        complaint_id,
        user_id,
        message_type,
        message
    ) VALUES (
        p_complaint_id,
        v_complaint.admin_id,
        'intervention',
        'JuntaPlay iniciou a intervenção para resolver esta reclamação'
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Intervenção iniciada'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. VIEWS PARA CONSULTA
-- ===========================================

-- View para reclamações com detalhes
CREATE OR REPLACE VIEW complaints_detailed AS
SELECT 
    c.*,
    g.name as group_name,
    g.service_id,
    s.name as service_name,
    u_profile.name as user_name,
    u_profile.email as user_email,
    a_profile.name as admin_name,
    a_profile.email as admin_email,
    COUNT(cm.id) as message_count,
    MAX(cm.created_at) as last_message_at
FROM public.complaints c
LEFT JOIN public.groups g ON c.group_id = g.id
LEFT JOIN public.services s ON g.service_id = s.id
LEFT JOIN public.profiles u_profile ON c.user_id = u_profile.user_id
LEFT JOIN public.profiles a_profile ON c.admin_id = a_profile.user_id
LEFT JOIN public.complaint_messages cm ON c.id = cm.complaint_id
GROUP BY c.id, g.name, g.service_id, s.name, u_profile.name, u_profile.email, a_profile.name, a_profile.email;

-- View para estatísticas de reclamações
CREATE OR REPLACE VIEW complaint_stats AS
SELECT 
    status,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
    AVG(EXTRACT(EPOCH FROM (COALESCE(resolved_at, NOW()) - created_at))/86400) as avg_days_to_resolve
FROM public.complaints
GROUP BY status;

-- 5. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ===========================================

-- Ativar RLS nas tabelas
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_evidence ENABLE ROW LEVEL SECURITY;

-- Políticas para complaints
CREATE POLICY "Users can view their own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view complaints for their groups" ON public.complaints
    FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY "Users can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update complaints for their groups" ON public.complaints
    FOR UPDATE USING (auth.uid() = admin_id);

-- Políticas para complaint_messages
CREATE POLICY "Users can view messages for their complaints" ON public.complaint_messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.complaints WHERE id = complaint_id
            UNION
            SELECT admin_id FROM public.complaints WHERE id = complaint_id
        )
    );

CREATE POLICY "Users can create messages for their complaints" ON public.complaint_messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.complaints WHERE id = complaint_id
            UNION
            SELECT admin_id FROM public.complaints WHERE id = complaint_id
        )
    );

-- Políticas para complaint_evidence
CREATE POLICY "Users can view evidence for their complaints" ON public.complaint_evidence
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.complaints WHERE id = complaint_id
            UNION
            SELECT admin_id FROM public.complaints WHERE id = complaint_id
        )
    );

CREATE POLICY "Users can create evidence for their complaints" ON public.complaint_evidence
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.complaints WHERE id = complaint_id
            UNION
            SELECT admin_id FROM public.complaints WHERE id = complaint_id
        )
    );

-- 6. TRIGGERS PARA AUTOMAÇÃO
-- ===========================================

-- Trigger para notificar admin quando reclamação é criada
CREATE OR REPLACE FUNCTION notify_admin_complaint()
RETURNS TRIGGER AS $$
BEGIN
    -- Aqui você pode adicionar lógica para enviar notificação
    -- Por exemplo, inserir na tabela de notificações
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        data
    ) VALUES (
        NEW.admin_id,
        'complaint_created',
        'Nova reclamação recebida',
        'Você recebeu uma nova reclamação no grupo ' || (
            SELECT name FROM public.groups WHERE id = NEW.group_id
        ),
        json_build_object(
            'complaint_id', NEW.id,
            'group_id', NEW.group_id,
            'user_id', NEW.user_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_admin_complaint
    AFTER INSERT ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_complaint();

-- Trigger para verificar se intervenção é necessária
CREATE OR REPLACE FUNCTION check_intervention_needed()
RETURNS TRIGGER AS $$
BEGIN
    -- Se passou do prazo de intervenção e ainda está pendente
    IF NEW.status = 'pending' AND NOW() > NEW.intervention_deadline THEN
        NEW.status := 'intervention';
        
        -- Adicionar mensagem de intervenção automática
        INSERT INTO public.complaint_messages (
            complaint_id,
            user_id,
            message_type,
            message
        ) VALUES (
            NEW.id,
            NEW.admin_id,
            'intervention',
            'JuntaPlay iniciou a intervenção automaticamente após o prazo limite'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_intervention_needed
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION check_intervention_needed();

-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ===========================================

COMMENT ON TABLE public.complaints IS 'Sistema de reclamações baseado no fluxo do Kotas';
COMMENT ON COLUMN public.complaints.problem_type IS 'Tipo do problema: subscription_stopped, service_different_description, admin_payment_outside_site, other';
COMMENT ON COLUMN public.complaints.desired_solution IS 'Solução desejada: problem_solution, problem_solution_and_refund, subscription_cancellation_and_refund';
COMMENT ON COLUMN public.complaints.status IS 'Status: pending, admin_responded, user_responded, intervention, resolved, closed';
COMMENT ON COLUMN public.complaints.admin_response_deadline IS 'Prazo para admin responder (7 dias)';
COMMENT ON COLUMN public.complaints.intervention_deadline IS 'Prazo para intervenção da JuntaPlay (14 dias)';

COMMENT ON TABLE public.complaint_messages IS 'Mensagens e conversas das reclamações';
COMMENT ON COLUMN public.complaint_messages.message_type IS 'Tipo: opening, user_message, admin_message, system_message, intervention';

COMMENT ON TABLE public.complaint_evidence IS 'Evidências anexadas às reclamações';
COMMENT ON COLUMN public.complaint_evidence.evidence_type IS 'Tipo: screenshot, document, conversation, payment_proof, other'; 