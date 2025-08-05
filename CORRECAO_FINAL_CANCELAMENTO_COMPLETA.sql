-- ===========================================
-- CORREÇÃO FINAL COMPLETA DO SISTEMA DE CANCELAMENTO
-- ===========================================

-- 1. VERIFICAR E CORRIGIR TABELA GROUP_MEMBERSHIPS
-- ===========================================

-- Adicionar campos necessários para cancelamento
ALTER TABLE public.group_memberships 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired'));

-- 2. CRIAR TABELA COMPLAINTS (se não existir)
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

-- 3. CRIAR TABELAS DO SISTEMA DE CANCELAMENTO
-- ===========================================

-- Tabela de cancelamentos
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

-- Tabela de reembolsos
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    cancellation_id UUID REFERENCES public.cancellations(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    reason TEXT NOT NULL,
    pix_key TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de restrições de usuário
CREATE TABLE IF NOT EXISTS public.user_restrictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    restriction_type TEXT DEFAULT 'group_participation' CHECK (restriction_type IN ('group_participation', 'withdrawal', 'complaint')),
    restriction_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR FUNÇÃO PROCESS_CANCELLATION
-- ===========================================

CREATE OR REPLACE FUNCTION process_cancellation(
    p_membership_id UUID,
    p_reason TEXT,
    p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_group_id UUID;
    v_cancellation_id UUID;
    v_refund_amount_cents INTEGER;
    v_processing_fee_cents INTEGER;
    v_final_refund_cents INTEGER;
    v_restriction_days INTEGER;
    v_restriction_until TIMESTAMP WITH TIME ZONE;
    v_days_member INTEGER;
    v_joined_at TIMESTAMP WITH TIME ZONE;
    v_monthly_value_cents INTEGER;
BEGIN
    -- Buscar dados do membership
    SELECT 
        gm.group_id,
        gm.joined_at,
        g.price_per_slot_cents
    INTO v_group_id, v_joined_at, v_monthly_value_cents
    FROM public.group_memberships gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE gm.id = p_membership_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Membership não encontrado';
    END IF;
    
    -- Calcular dias desde que entrou
    v_days_member := EXTRACT(DAY FROM (NOW() - v_joined_at));
    
    -- Calcular restrição (15 dias mínimo, 30 se menos de 5 dias)
    v_restriction_days := GREATEST(15, CASE WHEN v_days_member < 5 THEN 30 ELSE 15 END);
    v_restriction_until := NOW() + INTERVAL '1 day' * v_restriction_days;
    
    -- Calcular reembolso proporcional
    DECLARE
        days_in_month INTEGER := 30;
        days_remaining INTEGER;
        monthly_value_cents INTEGER;
        refund_amount DECIMAL;
        processing_fee DECIMAL;
        final_refund DECIMAL;
    BEGIN
        -- Calcular dias restantes
        days_remaining := GREATEST(0, days_in_month - v_days_member);
        
        -- Calcular valores
        monthly_value_cents := COALESCE(v_monthly_value_cents, 0);
        refund_amount := (monthly_value_cents::DECIMAL / days_in_month) * days_remaining;
        processing_fee := LEAST(refund_amount * 0.05, 250); -- 5% ou R$ 2,50 máximo
        final_refund := GREATEST(0, refund_amount - processing_fee);
        
        v_refund_amount_cents := refund_amount::INTEGER;
        v_processing_fee_cents := processing_fee::INTEGER;
        v_final_refund_cents := final_refund::INTEGER;
    END;
    
    -- Criar registro de cancelamento
    INSERT INTO public.cancellations (
        user_id,
        group_id,
        membership_id,
        reason,
        refund_amount_cents,
        processing_fee_cents,
        final_refund_cents,
        restriction_days,
        restriction_until
    ) VALUES (
        p_user_id,
        v_group_id,
        p_membership_id,
        p_reason,
        v_refund_amount_cents,
        v_processing_fee_cents,
        v_final_refund_cents,
        v_restriction_days,
        v_restriction_until
    ) RETURNING id INTO v_cancellation_id;
    
    -- Atualizar status do membership
    UPDATE public.group_memberships 
    SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = p_reason
    WHERE id = p_membership_id;
    
    -- Criar restrição de usuário
    INSERT INTO public.user_restrictions (
        user_id,
        reason,
        restriction_type,
        restriction_until
    ) VALUES (
        p_user_id,
        'Cancelamento de grupo',
        'group_participation',
        v_restriction_until
    );
    
    -- Se houver reembolso, criar solicitação
    IF v_final_refund_cents > 0 THEN
        INSERT INTO public.refunds (
            user_id,
            group_id,
            cancellation_id,
            amount_cents,
            reason
        ) VALUES (
            p_user_id,
            v_group_id,
            v_cancellation_id,
            v_final_refund_cents,
            'cancellation'
        );
    END IF;
    
    RETURN v_cancellation_id;
END;
$$ LANGUAGE plpgsql;

-- 5. HABILITAR RLS E CRIAR POLÍTICAS
-- ===========================================

-- Políticas para complaints
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;
CREATE POLICY "Users can view their own complaints" ON public.complaints
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = admin_id);

DROP POLICY IF EXISTS "Users can create their own complaints" ON public.complaints;
CREATE POLICY "Users can create their own complaints" ON public.complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update complaints" ON public.complaints;
CREATE POLICY "Admins can update complaints" ON public.complaints
    FOR UPDATE USING (auth.uid() = admin_id);

-- Políticas para cancellations
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cancellations" ON public.cancellations;
CREATE POLICY "Users can view their own cancellations" ON public.cancellations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own cancellations" ON public.cancellations;
CREATE POLICY "Users can create their own cancellations" ON public.cancellations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para refunds
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own refunds" ON public.refunds;
CREATE POLICY "Users can view their own refunds" ON public.refunds
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own refunds" ON public.refunds;
CREATE POLICY "Users can create their own refunds" ON public.refunds
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_restrictions
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own restrictions" ON public.user_restrictions;
CREATE POLICY "Users can view their own restrictions" ON public.user_restrictions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own restrictions" ON public.user_restrictions;
CREATE POLICY "Users can create their own restrictions" ON public.user_restrictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_group_id ON public.complaints(group_id);
CREATE INDEX IF NOT EXISTS idx_complaints_admin_id ON public.complaints(admin_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at);

CREATE INDEX IF NOT EXISTS idx_cancellations_user_id ON public.cancellations(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_group_id ON public.cancellations(group_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_membership_id ON public.cancellations(membership_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_created_at ON public.cancellations(created_at);

CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON public.refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON public.refunds(created_at);

CREATE INDEX IF NOT EXISTS idx_user_restrictions_user_id ON public.user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_active ON public.user_restrictions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_restrictions_until ON public.user_restrictions(restriction_until);

-- 7. VERIFICAÇÃO FINAL
-- ===========================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('group_memberships', 'complaints', 'cancellations', 'refunds', 'user_restrictions')
ORDER BY table_name, ordinal_position;

-- Verificar se os campos necessários existem
SELECT 
    table_name,
    column_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'group_memberships'
AND column_name IN ('cancelled_at', 'cancellation_reason', 'status')
ORDER BY column_name;

-- Verificar se a função existe
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'process_cancellation';

-- Contar registros nas tabelas
SELECT 
    'group_memberships' as table_name,
    COUNT(*) as total_records
FROM public.group_memberships
UNION ALL
SELECT 
    'complaints' as table_name,
    COUNT(*) as total_records
FROM public.complaints
UNION ALL
SELECT 
    'cancellations' as table_name,
    COUNT(*) as total_records
FROM public.cancellations
UNION ALL
SELECT 
    'refunds' as table_name,
    COUNT(*) as total_records
FROM public.refunds
UNION ALL
SELECT 
    'user_restrictions' as table_name,
    COUNT(*) as total_records
FROM public.user_restrictions;

-- Testar queries específicas
SELECT 
    'Test group_memberships active' as test,
    COUNT(*) as total_records
FROM public.group_memberships
WHERE status = 'active';

SELECT 
    'Test group_memberships cancelled' as test,
    COUNT(*) as total_records
FROM public.group_memberships
WHERE status = 'cancelled'; 