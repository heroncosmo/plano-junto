-- ===========================================
-- VERIFICAÇÃO FINAL DAS TABELAS
-- ===========================================

-- 1. VERIFICAR TABELA GROUPS
-- ===========================================
SELECT 
    'groups' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'groups'
ORDER BY ordinal_position;

-- 2. VERIFICAR TABELA GROUP_MEMBERSHIPS
-- ===========================================
SELECT 
    'group_memberships' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'group_memberships'
ORDER BY ordinal_position;

-- 3. VERIFICAR TABELA COMPLAINTS
-- ===========================================
SELECT 
    'complaints' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'complaints'
ORDER BY ordinal_position;

-- 4. VERIFICAR TABELA CANCELLATIONS
-- ===========================================
SELECT 
    'cancellations' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'cancellations'
ORDER BY ordinal_position;

-- 5. VERIFICAR TABELA REFUNDS
-- ===========================================
SELECT 
    'refunds' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'refunds'
ORDER BY ordinal_position;

-- 6. VERIFICAR TABELA USER_RESTRICTIONS
-- ===========================================
SELECT 
    'user_restrictions' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_restrictions'
ORDER BY ordinal_position;

-- 7. TESTAR QUERIES
-- ===========================================

-- Testar query de group_memberships
SELECT 
    'Test group_memberships' as test,
    COUNT(*) as total_records
FROM public.group_memberships;

-- Testar query de complaints
SELECT 
    'Test complaints' as test,
    COUNT(*) as total_records
FROM public.complaints;

-- Testar query de cancellations
SELECT 
    'Test cancellations' as test,
    COUNT(*) as total_records
FROM public.cancellations;

-- 8. VERIFICAR POLÍTICAS RLS
-- ===========================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('complaints', 'cancellations', 'refunds', 'user_restrictions')
ORDER BY tablename, policyname; 