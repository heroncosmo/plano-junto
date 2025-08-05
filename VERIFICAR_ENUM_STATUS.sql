-- ===========================================
-- VERIFICAR ENUMS CORRETOS
-- ===========================================

-- 1. VERIFICAR ENUM DA TABELA GROUPS
-- ===========================================
SELECT 
    'Enum da tabela groups' as info,
    enumlabel as valor_possivel
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'group_status'
)
ORDER BY enumsortorder;

-- 2. VERIFICAR ENUM DA TABELA GROUP_MEMBERSHIPS
-- ===========================================
SELECT 
    'Enum da tabela group_memberships' as info,
    enumlabel as valor_possivel
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'membership_status'
)
ORDER BY enumsortorder;

-- 3. VERIFICAR ESTRUTURA DAS TABELAS
-- ===========================================
SELECT 
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('groups', 'group_memberships')
AND column_name = 'status'
ORDER BY table_name;

-- 4. VERIFICAR DADOS ATUAIS
-- ===========================================

-- Status dos grupos
SELECT 
    'Status dos grupos' as info,
    status,
    COUNT(*) as total
FROM public.groups
GROUP BY status
ORDER BY status;

-- Status dos memberships
SELECT 
    'Status dos memberships' as info,
    status,
    COUNT(*) as total
FROM public.group_memberships
GROUP BY status
ORDER BY status;

-- 5. TESTAR QUERIES CORRETAS
-- ===========================================

-- Teste com valores corretos para groups
SELECT 
    'Grupos ativos' as teste,
    COUNT(*) as total
FROM public.groups
WHERE status = 'active_with_slots';

-- Teste com valores corretos para group_memberships
SELECT 
    'Memberships ativos' as teste,
    COUNT(*) as total
FROM public.group_memberships
WHERE status = 'active'; 