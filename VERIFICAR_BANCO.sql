-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DO BANCO DE DADOS
-- =====================================================

-- Verificar se as tabelas principais existem
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('groups', 'group_memberships', 'users', 'complaints')
ORDER BY table_name;

-- Verificar se as tabelas do sistema de cancelamento existem
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cancellations', 'refunds', 'user_restrictions')
ORDER BY table_name;

-- Verificar estrutura da tabela group_memberships
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'group_memberships'
ORDER BY ordinal_position;

-- Verificar se as funções do sistema de cancelamento existem
SELECT 
    proname as function_name,
    'EXISTS' as status
FROM pg_proc 
WHERE proname IN ('calculate_refund_amount', 'process_cancellation');

-- Verificar políticas RLS
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
WHERE tablename IN ('cancellations', 'refunds', 'user_restrictions')
ORDER BY tablename, policyname;

-- Verificar índices
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('cancellations', 'refunds', 'user_restrictions', 'group_memberships')
ORDER BY tablename, indexname;

-- =====================================================
-- TESTE DE FUNCIONALIDADE
-- =====================================================

-- Verificar se há dados de exemplo
SELECT 
    'groups' as table_name,
    COUNT(*) as record_count
FROM public.groups
UNION ALL
SELECT 
    'group_memberships' as table_name,
    COUNT(*) as record_count
FROM public.group_memberships
UNION ALL
SELECT 
    'cancellations' as table_name,
    COUNT(*) as record_count
FROM public.cancellations
UNION ALL
SELECT 
    'refunds' as table_name,
    COUNT(*) as record_count
FROM public.refunds
UNION ALL
SELECT 
    'user_restrictions' as table_name,
    COUNT(*) as record_count
FROM public.user_restrictions;

-- =====================================================
-- RESUMO
-- =====================================================

-- Mostrar todas as tabelas do schema public
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('groups', 'group_memberships', 'users') THEN 'CORE TABLES'
        WHEN table_name IN ('cancellations', 'refunds', 'user_restrictions') THEN 'CANCELLATION SYSTEM'
        ELSE 'OTHER TABLES'
    END as category
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY category, table_name; 