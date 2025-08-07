-- ========================================
-- TESTE: SISTEMA DE RECLAMAÇÕES DO ADMIN
-- ========================================
-- Este script testa se o sistema está funcionando corretamente

-- 1. Verificar se as funções de mediação existem
SELECT 'Verificando funções de mediação...' as status;

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('process_admin_refund', 'close_complaint_without_refund')
AND routine_schema = 'public';

-- 2. Verificar reclamações ativas (não fechadas/resolvidas)
SELECT 'Verificando reclamações ativas...' as status;

SELECT 
  c.id,
  c.user_id,
  c.group_id,
  c.status,
  c.created_at,
  c.admin_response_deadline,
  c.intervention_deadline,
  p.full_name as user_name,
  g.name as group_name,
  CASE 
    WHEN c.admin_response_deadline < NOW() THEN 'VENCIDA'
    WHEN c.intervention_deadline < NOW() THEN 'PRONTA PARA INTERVENÇÃO'
    ELSE 'DENTRO DO PRAZO'
  END as deadline_status
FROM complaints c
LEFT JOIN profiles p ON c.user_id = p.user_id
LEFT JOIN groups g ON c.group_id = g.id
WHERE c.status NOT IN ('closed', 'resolved')
ORDER BY c.created_at DESC;

-- 3. Verificar reclamações fechadas para histórico
SELECT 'Verificando reclamações fechadas...' as status;

SELECT 
  c.id,
  c.user_id,
  c.group_id,
  c.status,
  c.created_at,
  c.closed_at,
  c.resolved_at,
  p.full_name as user_name,
  g.name as group_name
FROM complaints c
LEFT JOIN profiles p ON c.user_id = p.user_id
LEFT JOIN groups g ON c.group_id = g.id
WHERE c.status IN ('closed', 'resolved')
ORDER BY c.created_at DESC
LIMIT 5;

-- 4. Testar se há reclamações prontas para intervenção
SELECT 'Verificando reclamações prontas para intervenção...' as status;

SELECT 
  c.id,
  c.user_id,
  c.group_id,
  c.status,
  c.created_at,
  c.admin_response_deadline,
  c.intervention_deadline,
  p.full_name as user_name,
  g.name as group_name,
  CASE 
    WHEN c.intervention_deadline < NOW() THEN 'PRONTA PARA INTERVENÇÃO'
    WHEN c.admin_response_deadline < NOW() THEN 'VENCIDA - ADMIN NÃO RESPONDEU'
    ELSE 'DENTRO DO PRAZO'
  END as intervention_status
FROM complaints c
LEFT JOIN profiles p ON c.user_id = p.user_id
LEFT JOIN groups g ON c.group_id = g.id
WHERE c.status NOT IN ('closed', 'resolved')
  AND c.intervention_deadline < NOW()
ORDER BY c.created_at DESC;

-- 5. Mostrar estatísticas gerais
SELECT 'Estatísticas gerais...' as status;

SELECT 
  COUNT(*) as total_complaints,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'admin_responded' THEN 1 END) as admin_responded,
  COUNT(CASE WHEN status = 'user_responded' THEN 1 END) as user_responded,
  COUNT(CASE WHEN status = 'intervention' THEN 1 END) as intervention,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
  COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
  COUNT(CASE WHEN admin_response_deadline < NOW() AND status NOT IN ('closed', 'resolved') THEN 1 END) as overdue,
  COUNT(CASE WHEN intervention_deadline < NOW() AND status NOT IN ('closed', 'resolved') THEN 1 END) as ready_for_intervention
FROM complaints;

-- 6. Instruções para testar o frontend
SELECT 'Para testar o frontend:' as instruction UNION ALL
SELECT '1. Acesse http://localhost:8081/admin/complaints' UNION ALL
SELECT '2. Verifique se a reclamação ativa aparece' UNION ALL
SELECT '3. Verifique os logs no console do navegador' UNION ALL
SELECT '4. Teste o botão "Ver Fechadas" para ver histórico' UNION ALL
SELECT '5. Se não aparecer, verifique os logs de debug';

SELECT 'Sistema de reclamações do admin testado!' as status; 