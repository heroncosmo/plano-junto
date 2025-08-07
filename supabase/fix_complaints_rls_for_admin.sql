-- ========================================
-- CORREÇÃO: POLÍTICAS RLS PARA COMPLAINTS
-- ========================================
-- Este script adiciona políticas RLS para permitir que
-- administradores do sistema vejam todas as reclamações

-- 1. Verificar se RLS está habilitado na tabela complaints
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'complaints';

-- 2. Adicionar política para administradores verem todas as reclamações
-- Esta política permite que usuários admin vejam todas as reclamações
-- para fins de mediação do sistema
CREATE POLICY "Admins can view all complaints" ON complaints
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
  auth.uid() = user_id
  OR
  -- Permitir se o usuário é o admin do grupo
  auth.uid() = admin_id
);

-- 3. Verificar todas as políticas atuais na tabela complaints
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'complaints'
ORDER BY policyname;

-- 4. Testar se a política funciona
-- (Este teste será executado pelo usuário logado como admin)
SELECT 'Política de admin adicionada com sucesso!' as status;

-- 5. Instruções para testar
SELECT 'Para testar:' as instruction UNION ALL
SELECT '1. Certifique-se de estar logado como rodrigoheleno7@gmail.com' UNION ALL
SELECT '2. Acesse http://localhost:8082/admin/complaints' UNION ALL
SELECT '3. Verifique se as reclamações aparecem agora' UNION ALL
SELECT '4. Se não aparecer, verifique os logs do console';

SELECT 'Correção RLS para complaints concluída!' as status; 