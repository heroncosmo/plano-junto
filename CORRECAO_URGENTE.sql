-- ===========================================
-- CORREÇÃO URGENTE - PROBLEMAS IDENTIFICADOS
-- ===========================================

-- 1. VERIFICAR SE A TABELA COMPLAINTS EXISTE
-- ===========================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaints'
ORDER BY ordinal_position;

-- 2. CRIAR TABELA COMPLAINTS SE NÃO EXISTIR
-- ===========================================
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

-- 3. HABILITAR RLS PARA COMPLAINTS
-- ===========================================
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS PARA COMPLAINTS
-- ===========================================
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
CREATE POLICY "Users can view their own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = admin_id);

DROP POLICY IF EXISTS "Users can create their own complaints" ON public.complaints;
CREATE POLICY "Users can create their own complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update complaints" ON public.complaints;
CREATE POLICY "Admins can update complaints" ON public.complaints
    FOR UPDATE USING (auth.uid() = admin_id);

-- 5. CRIAR ÍNDICES PARA COMPLAINTS
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_group_id ON public.complaints(group_id);
CREATE INDEX IF NOT EXISTS idx_complaints_admin_id ON public.complaints(admin_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at);

-- 6. VERIFICAR TABELA CANCELLATIONS
-- ===========================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'cancellations'
ORDER BY ordinal_position;

-- 7. CRIAR TABELA CANCELLATIONS SE NÃO EXISTIR
-- ===========================================
CREATE TABLE IF NOT EXISTS public.cancellations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    membership_id UUID REFERENCES public.group_memberships(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    refund_amount_cents INTEGER DEFAULT 0,
    processing_fee_cents INTEGER DEFAULT 0,
    final_refund_cents INTEGER DEFAULT 0,
    restriction_days INTEGER DEFAULT 15,
    restriction_until TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. HABILITAR RLS PARA CANCELLATIONS
-- ===========================================
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS RLS PARA CANCELLATIONS
-- ===========================================
DROP POLICY IF EXISTS "Users can view their own cancellations" ON public.cancellations;
CREATE POLICY "Users can view their own cancellations" ON public.cancellations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own cancellations" ON public.cancellations;
CREATE POLICY "Users can create their own cancellations" ON public.cancellations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. CRIAR ÍNDICES PARA CANCELLATIONS
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_cancellations_user_id ON public.cancellations(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_group_id ON public.cancellations(group_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_membership_id ON public.cancellations(membership_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_created_at ON public.cancellations(created_at);

-- 11. VERIFICAÇÃO FINAL
-- ===========================================
-- Verificar se as tabelas foram criadas corretamente
SELECT 
    'complaints' as table_name,
    COUNT(*) as total_records
FROM public.complaints
UNION ALL
SELECT 
    'cancellations' as table_name,
    COUNT(*) as total_records
FROM public.cancellations;

-- Testar queries específicas
SELECT 
    'Test complaints query' as test,
    COUNT(*) as total_records
FROM public.complaints
WHERE status IN ('pending', 'admin_responded', 'user_responded');

SELECT 
    'Test cancellations query' as test,
    COUNT(*) as total_records
FROM public.cancellations
WHERE membership_id IS NOT NULL; 