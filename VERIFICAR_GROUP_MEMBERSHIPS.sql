-- ===========================================
-- VERIFICAR E CORRIGIR TABELA GROUP_MEMBERSHIPS
-- ===========================================

-- Verificar estrutura atual da tabela
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'group_memberships'
ORDER BY ordinal_position;

-- Adicionar campos necessários para cancelamento
ALTER TABLE public.group_memberships 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired'));

-- Verificar novamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'group_memberships'
ORDER BY ordinal_position;

-- Verificar se as tabelas do sistema de cancelamento existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cancellations', 'refunds', 'user_restrictions')
ORDER BY table_name; 