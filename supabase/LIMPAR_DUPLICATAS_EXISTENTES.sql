-- ===========================================
-- LIMPEZA DE NOTIFICAÇÕES DUPLICADAS EXISTENTES
-- ===========================================

-- Script para limpar notificações duplicadas que já existem no banco
-- Execute este script no painel do Supabase SQL Editor

-- 1. Criar uma tabela temporária com as notificações únicas
CREATE TEMP TABLE temp_unique_notifications AS
WITH ranked_notifications AS (
  SELECT 
    *,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, title, message 
      ORDER BY created_at DESC
    ) as rn
  FROM notifications
)
SELECT * FROM ranked_notifications WHERE rn = 1;

-- 2. Deletar todas as notificações duplicadas
DELETE FROM notifications 
WHERE id NOT IN (
  SELECT id FROM temp_unique_notifications
);

-- 3. Verificar o resultado
SELECT 
  'Total de notificações após limpeza' as status,
  COUNT(*) as count
FROM notifications;

-- 4. Mostrar estatísticas por usuário
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
  COUNT(*) FILTER (WHERE is_important = TRUE) as important_count
FROM notifications
GROUP BY user_id
ORDER BY total_notifications DESC;

-- 5. Limpar tabela temporária
DROP TABLE temp_unique_notifications; 