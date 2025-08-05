-- ========================================
-- COMANDO PARA LIMPAR TODAS AS NOTIFICAÇÕES
-- ========================================

-- CUIDADO: Este comando remove TODAS as notificações de TODOS os usuários
-- Use apenas se quiser começar do zero

-- Para limpar todas as notificações:
DELETE FROM public.notifications;

-- Para resetar o contador de IDs (opcional):
-- ALTER SEQUENCE notifications_id_seq RESTART WITH 1;

-- Para verificar se limpou:
SELECT COUNT(*) as total_notifications FROM public.notifications;

-- ========================================
-- RESULTADO ESPERADO APÓS EXECUÇÃO:
-- - total_notifications: 0
-- ========================================