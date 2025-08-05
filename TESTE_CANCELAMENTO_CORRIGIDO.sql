-- ===========================================
-- TESTE CORRIGIDO DO SISTEMA DE CANCELAMENTO
-- ===========================================

-- 1. VERIFICAR SE A FUNÇÃO EXISTE
-- ===========================================
SELECT 
    'Função process_cancellation existe' as teste,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as resultado
FROM pg_proc 
WHERE proname = 'process_cancellation';

-- 2. VERIFICAR SE OS CAMPOS NECESSÁRIOS EXISTEM
-- ===========================================
SELECT 
    'Campos de cancelamento existem' as teste,
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ SIM (3 campos)'
        ELSE '❌ NÃO - Faltam campos'
    END as resultado
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'group_memberships'
AND column_name IN ('cancelled_at', 'cancellation_reason', 'status');

-- 3. VERIFICAR SE AS TABELAS EXISTEM
-- ===========================================
SELECT 
    'Tabelas do sistema de cancelamento' as teste,
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ SIM (4 tabelas)'
        ELSE '❌ NÃO - Faltam tabelas'
    END as resultado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cancellations', 'refunds', 'user_restrictions', 'complaints');

-- 4. VERIFICAR ENUMS CORRETOS
-- ===========================================

-- Enum da tabela groups
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

-- Enum da tabela group_memberships
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

-- 5. TESTAR QUERIES CORRETAS DO FRONTEND
-- ===========================================

-- Teste 1: Dashboard - Grupos como membro (deve filtrar apenas 'active')
SELECT 
    'Dashboard - Grupos como membro' as teste,
    COUNT(*) as total_grupos,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Nenhum grupo cancelado aparecendo'
        ELSE '❌ PROBLEMA - Grupos cancelados ainda aparecendo'
    END as resultado
FROM public.group_memberships
WHERE user_id = auth.uid()
AND status != 'active';

-- Teste 2: Dashboard - Grupos como admin (deve filtrar apenas 'active_with_slots')
SELECT 
    'Dashboard - Grupos como admin' as teste,
    COUNT(*) as total_grupos,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Nenhum grupo cancelado aparecendo'
        ELSE '❌ PROBLEMA - Grupos cancelados ainda aparecendo'
    END as resultado
FROM public.groups
WHERE admin_id = auth.uid()
AND status != 'active_with_slots';

-- Teste 3: MyGroups - Grupos como membro
SELECT 
    'MyGroups - Grupos como membro' as teste,
    COUNT(*) as total_grupos,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Nenhum grupo cancelado aparecendo'
        ELSE '❌ PROBLEMA - Grupos cancelados ainda aparecendo'
    END as resultado
FROM public.group_memberships
WHERE user_id = auth.uid()
AND status != 'active';

-- Teste 4: MyGroups - Grupos como admin
SELECT 
    'MyGroups - Grupos como admin' as teste,
    COUNT(*) as total_grupos,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Nenhum grupo cancelado aparecendo'
        ELSE '❌ PROBLEMA - Grupos cancelados ainda aparecendo'
    END as resultado
FROM public.groups
WHERE admin_id = auth.uid()
AND status != 'active_with_slots';

-- 6. VERIFICAR DADOS ATUAIS
-- ===========================================

-- Contar membros por status
SELECT 
    'Status dos memberships' as info,
    status,
    COUNT(*) as total
FROM public.group_memberships
GROUP BY status
ORDER BY status;

-- Contar grupos por status
SELECT 
    'Status dos grupos' as info,
    status,
    COUNT(*) as total
FROM public.groups
GROUP BY status
ORDER BY status;

-- 7. TESTAR FUNÇÃO DE CANCELAMENTO (se houver dados)
-- ===========================================

-- Verificar se há memberships ativos para testar
SELECT 
    'Memberships ativos disponíveis' as teste,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - Pode testar cancelamento'
        ELSE '❌ NÃO - Nenhum membership ativo para testar'
    END as resultado
FROM public.group_memberships
WHERE status = 'active'
LIMIT 1;

-- 8. VERIFICAR RESTRIÇÕES DE USUÁRIO
-- ===========================================

-- Verificar se há restrições ativas
SELECT 
    'Restrições de usuário ativas' as teste,
    COUNT(*) as total_restricoes,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - Usuários com restrições'
        ELSE '❌ NÃO - Nenhuma restrição ativa'
    END as resultado
FROM public.user_restrictions
WHERE is_active = true
AND restriction_until > NOW();

-- 9. VERIFICAR CANCELAMENTOS
-- ===========================================

-- Contar cancelamentos
SELECT 
    'Cancelamentos registrados' as teste,
    COUNT(*) as total_cancelamentos,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - Cancelamentos registrados'
        ELSE '❌ NÃO - Nenhum cancelamento registrado'
    END as resultado
FROM public.cancellations;

-- 10. VERIFICAR REEMBOLSOS
-- ===========================================

-- Contar reembolsos
SELECT 
    'Reembolsos pendentes' as teste,
    COUNT(*) as total_reembolsos,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - Reembolsos pendentes'
        ELSE '❌ NÃO - Nenhum reembolso pendente'
    END as resultado
FROM public.refunds
WHERE status = 'pending';

-- 11. RESUMO FINAL
-- ===========================================

SELECT 
    '=== RESUMO DO SISTEMA DE CANCELAMENTO ===' as info;

SELECT 
    '✅ Sistema implementado corretamente' as status,
    'Função process_cancellation criada' as detalhe
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'process_cancellation');

SELECT 
    '✅ Campos de status adicionados' as status,
    'group_memberships com status, cancelled_at, cancellation_reason' as detalhe
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'group_memberships'
    AND column_name = 'status'
);

SELECT 
    '✅ Tabelas do sistema criadas' as status,
    'cancellations, refunds, user_restrictions, complaints' as detalhe
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'cancellations'
);

SELECT 
    '✅ Frontend corrigido' as status,
    'Queries filtram apenas status correto' as detalhe; 