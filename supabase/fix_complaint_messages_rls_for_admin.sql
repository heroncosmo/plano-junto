-- ========================================
-- CORREÇÃO: POLÍTICAS RLS PARA COMPLAINT_MESSAGES
-- ========================================
-- Este script adiciona políticas RLS para permitir que
-- administradores do sistema acessem complaint_messages

-- 1. Verificar se RLS está habilitado na tabela complaint_messages
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'complaint_messages';

-- 2. Adicionar política para administradores verem todas as mensagens
CREATE POLICY "Admins can view all complaint messages" ON complaint_messages
FOR SELECT
TO authenticated
USING (
  -- Permitir se o usuário é admin do sistema
  auth.jwt() ->> 'email' IN (
    'calcadosdrielle@gmail.com',
    'rodrigoheleno7@gmail.com'
  )
  OR
  -- Permitir se o usuário é o criador da reclamação
  auth.uid() IN (
    SELECT complaints.user_id
    FROM complaints
    WHERE complaints.id = complaint_messages.complaint_id
  )
  OR
  -- Permitir se o usuário é o admin do grupo
  auth.uid() IN (
    SELECT complaints.admin_id
    FROM complaints
    WHERE complaints.id = complaint_messages.complaint_id
  )
);

-- 3. Adicionar política para administradores inserirem mensagens
CREATE POLICY "Admins can insert complaint messages" ON complaint_messages
FOR INSERT
TO authenticated
WITH CHECK (
  -- Permitir se o usuário é admin do sistema
  auth.jwt() ->> 'email' IN (
    'calcadosdrielle@gmail.com',
    'rodrigoheleno7@gmail.com'
  )
  OR
  -- Permitir se o usuário é o criador da reclamação
  auth.uid() IN (
    SELECT complaints.user_id
    FROM complaints
    WHERE complaints.id = complaint_messages.complaint_id
  )
  OR
  -- Permitir se o usuário é o admin do grupo
  auth.uid() IN (
    SELECT complaints.admin_id
    FROM complaints
    WHERE complaints.id = complaint_messages.complaint_id
  )
);

-- 4. Verificar todas as políticas atuais na tabela complaint_messages
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'complaint_messages'
ORDER BY policyname;

-- 5. Testar se as políticas funcionam
-- (Este teste será executado pelo usuário logado como admin)
SELECT 'Políticas de admin adicionadas com sucesso!' as status;

-- 6. Instruções para testar
SELECT 'Para testar:' as instruction UNION ALL
SELECT '1. Certifique-se de estar logado como rodrigoheleno7@gmail.com' UNION ALL
SELECT '2. Acesse http://localhost:8082/admin/complaints' UNION ALL
SELECT '3. Clique em "Ver Reclamação"' UNION ALL
SELECT '4. Tente enviar uma mensagem de mediação' UNION ALL
SELECT '5. Tente definir um prazo' UNION ALL
SELECT '6. Se não funcionar, verifique os logs do console';

SELECT 'Correção RLS para complaint_messages concluída!' as status; 