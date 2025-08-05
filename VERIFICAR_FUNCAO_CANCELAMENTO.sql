-- ===========================================
-- VERIFICAR FUNÇÃO PROCESS_CANCELLATION
-- ===========================================

-- 1. VERIFICAR SE A FUNÇÃO EXISTE
-- ===========================================
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname = 'process_cancellation';

-- 2. CRIAR FUNÇÃO SE NÃO EXISTIR
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

-- 3. TESTAR A FUNÇÃO
-- ===========================================
-- Verificar se há memberships para testar
SELECT 
    'Test membership' as test,
    COUNT(*) as total_memberships
FROM public.group_memberships
WHERE status = 'active'
LIMIT 1;

-- 4. VERIFICAR SE AS TABELAS NECESSÁRIAS EXISTEM
-- ===========================================
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('cancellations', 'refunds', 'user_restrictions')
ORDER BY table_name, ordinal_position;

-- 5. VERIFICAR SE OS CAMPOS NECESSÁRIOS EXISTEM EM GROUP_MEMBERSHIPS
-- ===========================================
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'group_memberships'
AND column_name IN ('status', 'cancelled_at', 'cancellation_reason')
ORDER BY column_name; 