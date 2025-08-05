-- ===========================================
-- SISTEMA DE RECLAMAÇÕES - PLANO JUNTO (CORRIGIDO)
-- Execute este arquivo no painel do Supabase
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
        'pending',
        'admin_responded',
        'user_responded',
        'resolved',
        'closed',
        'intervention_required'
    )),
    
    -- Prazos
    admin_response_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    intervention_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Controle de contato
    user_contacted_admin BOOLEAN DEFAULT false,
    admin_contacted_user BOOLEAN DEFAULT false,
    
    -- Datas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de mensagens da reclamação
CREATE TABLE IF NOT EXISTS public.complaint_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    
    -- Tipo de mensagem
    message_type TEXT NOT NULL CHECK (message_type IN (
        'user_message',
        'admin_message',
        'system_message',
        'opening'
    )),
    
    -- Conteúdo
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    
    -- Controle
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anexos
CREATE TABLE IF NOT EXISTS public.complaint_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.complaint_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    
    -- Dados do arquivo
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    
    -- Metadados
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint_id ON public.complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_message_id ON public.complaint_attachments(message_id);

-- 3. VIEWS PARA FACILITAR CONSULTAS
-- ===========================================

-- View para reclamações com dados completos (CORRIGIDO)
CREATE OR REPLACE VIEW public.complaints_detailed AS
SELECT 
    c.*,
    g.name as group_name,
    s.name as service_name,
    s.category as service_category,
    u.full_name as user_name,
    a.full_name as admin_name,
    COUNT(cm.id) as message_count,
    MAX(cm.created_at) as last_message_at
FROM public.complaints c
LEFT JOIN public.groups g ON c.group_id = g.id
LEFT JOIN public.services s ON g.service_id = s.id
LEFT JOIN public.profiles u ON c.user_id = u.user_id
LEFT JOIN public.profiles a ON c.admin_id = a.user_id
LEFT JOIN public.complaint_messages cm ON c.id = cm.complaint_id
GROUP BY c.id, g.name, s.name, s.category, u.full_name, a.full_name;

-- View para mensagens com dados do usuário
CREATE OR REPLACE VIEW public.complaint_messages_detailed AS
SELECT 
    cm.*,
    p.full_name as user_name,
    p.avatar_url as user_avatar
FROM public.complaint_messages cm
LEFT JOIN public.profiles p ON cm.user_id = p.user_id;

-- 4. FUNÇÕES PARA AUTOMAÇÃO
-- ===========================================

-- Função para atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION public.update_complaint_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_complaint_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.update_complaint_updated_at();

-- Função para notificar admin sobre nova reclamação
CREATE OR REPLACE FUNCTION public.notify_admin_new_complaint()
RETURNS TRIGGER AS $$
BEGIN
    -- Aqui você pode adicionar lógica para enviar notificação
    -- Por exemplo, inserir na tabela de notificações
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        related_type,
        related_id,
        created_at
    ) VALUES (
        NEW.admin_id,
        'Nova reclamação recebida',
        'Você recebeu uma nova reclamação no seu grupo. Responda dentro de 7 dias.',
        'complaint',
        'complaint',
        NEW.id,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar admin
CREATE TRIGGER trigger_notify_admin_new_complaint
    AFTER INSERT ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_admin_new_complaint();

-- 5. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ===========================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas para complaints
CREATE POLICY "Users can view their own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view complaints in their groups" ON public.complaints
    FOR SELECT USING (auth.uid() = admin_id);

CREATE POLICY "Users can create complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own complaints" ON public.complaints
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update complaints in their groups" ON public.complaints
    FOR UPDATE USING (auth.uid() = admin_id);

-- Políticas para complaint_messages
CREATE POLICY "Users can view messages in their complaints" ON public.complaint_messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.complaints WHERE id = complaint_id
            UNION
            SELECT admin_id FROM public.complaints WHERE id = complaint_id
        )
    );

CREATE POLICY "Users can create messages in their complaints" ON public.complaint_messages
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.complaints WHERE id = complaint_id
            UNION
            SELECT admin_id FROM public.complaints WHERE id = complaint_id
        )
    );

-- Políticas para complaint_attachments
CREATE POLICY "Users can view attachments in their complaints" ON public.complaint_attachments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.complaints WHERE id = complaint_id
            UNION
            SELECT admin_id FROM public.complaints WHERE id = complaint_id
        )
    );

CREATE POLICY "Users can create attachments in their complaints" ON public.complaint_attachments
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.complaints WHERE id = complaint_id
            UNION
            SELECT admin_id FROM public.complaints WHERE id = complaint_id
        )
    );

-- 6. FUNÇÕES ÚTEIS PARA O SISTEMA
-- ===========================================

-- Função para buscar reclamações do usuário
CREATE OR REPLACE FUNCTION public.get_user_complaints(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    group_name TEXT,
    service_name TEXT,
    problem_type TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    message_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        g.name as group_name,
        s.name as service_name,
        c.problem_type,
        c.status,
        c.created_at,
        COUNT(cm.id) as message_count
    FROM public.complaints c
    LEFT JOIN public.groups g ON c.group_id = g.id
    LEFT JOIN public.services s ON g.service_id = s.id
    LEFT JOIN public.complaint_messages cm ON c.id = cm.complaint_id
    WHERE c.user_id = user_uuid
    GROUP BY c.id, g.name, s.name, c.problem_type, c.status, c.created_at
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar reclamações do admin
CREATE OR REPLACE FUNCTION public.get_admin_complaints(admin_uuid UUID)
RETURNS TABLE (
    id UUID,
    group_name TEXT,
    service_name TEXT,
    user_name TEXT,
    problem_type TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    message_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        g.name as group_name,
        s.name as service_name,
        p.full_name as user_name,
        c.problem_type,
        c.status,
        c.created_at,
        COUNT(cm.id) as message_count
    FROM public.complaints c
    LEFT JOIN public.groups g ON c.group_id = g.id
    LEFT JOIN public.services s ON g.service_id = s.id
    LEFT JOIN public.profiles p ON c.user_id = p.user_id
    LEFT JOIN public.complaint_messages cm ON c.id = cm.complaint_id
    WHERE c.admin_id = admin_uuid
    GROUP BY c.id, g.name, s.name, p.full_name, c.problem_type, c.status, c.created_at
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário pode criar reclamação
CREATE OR REPLACE FUNCTION public.can_create_complaint(user_uuid UUID, group_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_member BOOLEAN;
    existing_complaint UUID;
BEGIN
    -- Verificar se é membro do grupo
    SELECT EXISTS(
        SELECT 1 FROM public.group_memberships 
        WHERE user_id = user_uuid AND group_id = group_uuid
    ) INTO is_member;
    
    -- Verificar se já tem reclamação ativa
    SELECT id FROM public.complaints 
    WHERE user_id = user_uuid AND group_id = group_uuid AND status IN ('pending', 'admin_responded', 'user_responded')
    LIMIT 1 INTO existing_complaint;
    
    RETURN is_member AND existing_complaint IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ===========================================

COMMENT ON TABLE public.complaints IS 'Sistema de reclamações do Plano Junto';
COMMENT ON COLUMN public.complaints.problem_type IS 'Tipo do problema relatado pelo usuário';
COMMENT ON COLUMN public.complaints.desired_solution IS 'Solução desejada pelo usuário';
COMMENT ON COLUMN public.complaints.status IS 'Status atual da reclamação';
COMMENT ON COLUMN public.complaints.admin_response_deadline IS 'Prazo para resposta do admin (7 dias)';
COMMENT ON COLUMN public.complaints.intervention_deadline IS 'Prazo para intervenção da JuntaPlay (14 dias)';

COMMENT ON TABLE public.complaint_messages IS 'Mensagens trocadas na reclamação';
COMMENT ON COLUMN public.complaint_messages.message_type IS 'Tipo da mensagem: user_message, admin_message, system_message, opening';

COMMENT ON TABLE public.complaint_attachments IS 'Anexos das reclamações';
COMMENT ON COLUMN public.complaint_attachments.file_url IS 'URL do arquivo no storage';

-- ===========================================
-- SISTEMA DE RECLAMAÇÕES CRIADO COM SUCESSO!
-- ===========================================

-- Para testar, você pode executar:
-- SELECT * FROM public.complaints_detailed LIMIT 5;
-- SELECT * FROM public.complaint_messages_detailed LIMIT 5; 