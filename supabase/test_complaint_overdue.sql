-- ========================================
-- TESTE: CRIAR RECLAMAÇÃO VENCIDA
-- ========================================
-- Este SQL cria uma reclamação que já passou do prazo para testar o sistema

-- 1. Verificar se existe um grupo e usuários para testar
SELECT 'Verificando dados existentes...' as status;

-- Verificar grupos existentes
SELECT 
  g.id as group_id,
  g.name as group_name,
  g.admin_id,
  p.full_name as admin_name
FROM groups g
LEFT JOIN profiles p ON g.admin_id = p.user_id
LIMIT 3;

-- Verificar usuários existentes
SELECT 
  p.user_id,
  p.full_name
FROM profiles p
LIMIT 3;

-- 2. Criar uma reclamação vencida (se houver dados)
-- NOTA: Este comando só funcionará se você executar manualmente no Supabase
-- pois o MCP não permite INSERT

/*
-- Exemplo de como criar uma reclamação vencida:
INSERT INTO complaints (
  user_id,
  group_id,
  admin_id,
  problem_type,
  problem_description,
  desired_solution,
  status,
  created_at,
  admin_response_deadline,
  intervention_deadline,
  user_contacted_admin,
  admin_contacted_user
) VALUES (
  '54f2830f-4015-4117-9842-b4697ef84172', -- user_id (substitua por um user_id real)
  '4cb410c0-2f22-4e8d-87fc-ae007c373e89', -- group_id (substitua por um group_id real)
  '613815c9-7fba-4fb7-8b66-97cd2396aaf7', -- admin_id (substitua por um admin_id real)
  'subscription_stopped',
  'Teste de reclamação vencida para demonstrar o sistema de mediação',
  'problem_solution',
  'pending',
  NOW() - INTERVAL '10 days', -- Criada há 10 dias
  NOW() - INTERVAL '3 days',  -- Prazo vencido há 3 dias
  NOW() - INTERVAL '1 day',   -- Prazo de intervenção vencido há 1 dia
  true,
  false
);
*/

-- 3. Verificar reclamações existentes e seus prazos
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
    WHEN c.admin_response_deadline < NOW() THEN 'VENCIDA - ADMIN NÃO RESPONDEU'
    WHEN c.intervention_deadline < NOW() THEN 'VENCIDA - PRONTA PARA INTERVENÇÃO'
    ELSE 'DENTRO DO PRAZO'
  END as deadline_status,
  CASE 
    WHEN c.admin_response_deadline < NOW() THEN 
      EXTRACT(DAY FROM NOW() - c.admin_response_deadline) || ' dias vencida'
    WHEN c.intervention_deadline < NOW() THEN 
      EXTRACT(DAY FROM NOW() - c.intervention_deadline) || ' dias para intervenção'
    ELSE 
      EXTRACT(DAY FROM c.admin_response_deadline - NOW()) || ' dias restantes'
  END as time_status
FROM complaints c
LEFT JOIN profiles p ON c.user_id = p.user_id
LEFT JOIN groups g ON c.group_id = g.id
ORDER BY c.created_at DESC;

-- 4. Mostrar instruções para testar
SELECT 'Para testar o sistema:' as instruction UNION ALL
SELECT '1. Acesse http://localhost:8081/admin/complaints' UNION ALL
SELECT '2. Verifique se há reclamações vencidas destacadas em vermelho' UNION ALL
SELECT '3. Se não houver, crie uma reclamação manualmente no banco com prazo vencido' UNION ALL
SELECT '4. As reclamações vencidas mostrarão botões de mediação';

SELECT 'Sistema de mediação configurado e pronto para testes!' as status; 