-- =====================================================
-- SISTEMA COMPLETO DE CANCELAMENTO
-- Baseado no processo do Kotas
-- =====================================================

-- 1. TABELA DE CANCELAMENTOS
CREATE TABLE IF NOT EXISTS public.cancellations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.group_members(id) ON DELETE CASCADE,
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

-- 2. TABELA DE REEMBOLSOS
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

-- 3. TABELA DE RESTRIÇÕES DE USUÁRIO
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

-- 4. ADICIONAR CAMPOS À TABELA GROUP_MEMBERS
ALTER TABLE public.group_members 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 5. ADICIONAR CAMPOS À TABELA COMPLAINTS
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS closure_reason TEXT;

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para calcular reembolso proporcional
CREATE OR REPLACE FUNCTION calculate_refund_amount(
    member_id UUID,
    cancellation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    refund_amount_cents INTEGER,
    processing_fee_cents INTEGER,
    final_refund_cents INTEGER
) AS $$
DECLARE
    member_record RECORD;
    days_in_month INTEGER := 30;
    days_remaining INTEGER;
    monthly_value_cents INTEGER;
    refund_amount DECIMAL;
    processing_fee DECIMAL;
    final_refund DECIMAL;
BEGIN
    -- Buscar dados do membro
    SELECT 
        gm.joined_at,
        g.monthly_value_cents
    INTO member_record
    FROM public.group_members gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE gm.id = member_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calcular dias restantes
    days_remaining := GREATEST(0, days_in_month - EXTRACT(DAY FROM (cancellation_date - member_record.joined_at)));
    
    -- Calcular valores
    monthly_value_cents := COALESCE(member_record.monthly_value_cents, 0);
    refund_amount := (monthly_value_cents::DECIMAL / days_in_month) * days_remaining;
    processing_fee := LEAST(refund_amount * 0.05, 250); -- 5% ou R$ 2,50 máximo
    final_refund := GREATEST(0, refund_amount - processing_fee);
    
    RETURN QUERY SELECT 
        refund_amount::INTEGER,
        processing_fee::INTEGER,
        final_refund::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Função para processar cancelamento
CREATE OR REPLACE FUNCTION process_cancellation(
    p_member_id UUID,
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
BEGIN
    -- Buscar dados do membro
    SELECT 
        gm.group_id,
        gm.joined_at
    INTO v_group_id, v_days_member
    FROM public.group_members gm
    WHERE gm.id = p_member_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Membro não encontrado';
    END IF;
    
    -- Calcular restrição (15 dias mínimo, 30 se menos de 5 dias)
    v_days_member := EXTRACT(DAY FROM (NOW() - v_days_member));
    v_restriction_days := GREATEST(15, CASE WHEN v_days_member < 5 THEN 30 ELSE 15 END);
    v_restriction_until := NOW() + INTERVAL '1 day' * v_restriction_days;
    
    -- Calcular reembolso
    SELECT 
        refund_amount_cents,
        processing_fee_cents,
        final_refund_cents
    INTO 
        v_refund_amount_cents,
        v_processing_fee_cents,
        v_final_refund_cents
    FROM calculate_refund_amount(p_member_id);
    
    -- Criar registro de cancelamento
    INSERT INTO public.cancellations (
        user_id,
        group_id,
        member_id,
        reason,
        refund_amount_cents,
        processing_fee_cents,
        final_refund_cents,
        restriction_days,
        restriction_until
    ) VALUES (
        p_user_id,
        v_group_id,
        p_member_id,
        p_reason,
        v_refund_amount_cents,
        v_processing_fee_cents,
        v_final_refund_cents,
        v_restriction_days,
        v_restriction_until
    ) RETURNING id INTO v_cancellation_id;
    
    -- Atualizar status do membro
    UPDATE public.group_members 
    SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = p_reason
    WHERE id = p_member_id;
    
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

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- Políticas para cancellations
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cancellations" ON public.cancellations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cancellations" ON public.cancellations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para refunds
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own refunds" ON public.refunds
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own refunds" ON public.refunds
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_restrictions
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own restrictions" ON public.user_restrictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own restrictions" ON public.user_restrictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cancellations_user_id ON public.cancellations(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_group_id ON public.cancellations(group_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_created_at ON public.cancellations(created_at);

CREATE INDEX IF NOT EXISTS idx_refunds_user_id ON public.refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON public.refunds(created_at);

CREATE INDEX IF NOT EXISTS idx_user_restrictions_user_id ON public.user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_active ON public.user_restrictions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_restrictions_until ON public.user_restrictions(restriction_until);

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Inserir alguns motivos de cancelamento comuns
INSERT INTO public.cancellation_reasons (reason, description) VALUES
('group_problems', 'Tive problemas no grupo'),
('no_longer_use', 'Não irei mais utilizar o serviço'),
('money_tight', 'A grana ta curta, vou dar uma economizada'),
('group_too_slow', 'Muita demora para completar o grupo'),
('admin_communication', 'Falta de comunicação com o administrador'),
('service_issues', 'Problemas com o serviço de streaming'),
('personal_reasons', 'Motivos pessoais'),
('found_alternative', 'Encontrei uma alternativa melhor'),
('technical_issues', 'Problemas técnicos'),
('other', 'Outros')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS DAS TABELAS
-- =====================================================

COMMENT ON TABLE public.cancellations IS 'Registra todos os cancelamentos de grupos';
COMMENT ON TABLE public.refunds IS 'Registra todos os reembolsos solicitados';
COMMENT ON TABLE public.user_restrictions IS 'Registra restrições temporárias de usuários';

COMMENT ON COLUMN public.cancellations.refund_amount_cents IS 'Valor proporcional do reembolso em centavos';
COMMENT ON COLUMN public.cancellations.processing_fee_cents IS 'Taxa de processamento em centavos';
COMMENT ON COLUMN public.cancellations.final_refund_cents IS 'Valor final do reembolso em centavos';
COMMENT ON COLUMN public.cancellations.restriction_days IS 'Dias de restrição para participar de novos grupos';
COMMENT ON COLUMN public.cancellations.restriction_until IS 'Data até quando o usuário fica restrito';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('cancellations', 'refunds', 'user_restrictions')
ORDER BY table_name, ordinal_position;

-- Verificar se as funções foram criadas
SELECT proname FROM pg_proc WHERE proname IN ('calculate_refund_amount', 'process_cancellation'); 