-- ===========================================
-- VERIFICAR E CRIAR TABELA COMPLAINTS
-- ===========================================

-- Verificar se a tabela complaints existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaints'
ORDER BY ordinal_position;

-- Se não existir, criar a tabela básica
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Motivo da reclamação
    problem_type TEXT NOT NULL DEFAULT 'other',
    problem_description TEXT,
    
    -- Solução desejada
    desired_solution TEXT NOT NULL DEFAULT 'problem_solution',
    
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
    admin_contacted_user BOOLEAN DEFAULT FALSE
);

-- Habilitar RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS básicas
CREATE POLICY "Users can view their own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = admin_id);

CREATE POLICY "Users can create their own complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update complaints" ON public.complaints
    FOR UPDATE USING (auth.uid() = admin_id);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_group_id ON public.complaints(group_id);
CREATE INDEX IF NOT EXISTS idx_complaints_admin_id ON public.complaints(admin_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at);

-- Verificar novamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaints'
ORDER BY ordinal_position; 