-- ========================================
-- CORREÇÃO: POLÍTICAS RLS PARA PROFILES
-- ========================================
-- Este script adiciona políticas RLS para permitir que
-- administradores do sistema atualizem perfis para estornos

-- 1. Verificar se RLS está habilitado na tabela profiles
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Adicionar política para administradores atualizarem perfis
CREATE POLICY "Admins can update any profile for refunds" ON profiles
FOR UPDATE
TO authenticated
USING (
  -- Permitir se o usuário é admin do sistema
  auth.jwt() ->> 'email' IN (
    'calcadosdrielle@gmail.com',
    'rodrigoheleno7@gmail.com'
  )
  OR
  -- Permitir se o usuário está atualizando seu próprio perfil
  user_id = auth.uid()
);

-- 3. Verificar todas as políticas atuais na tabela profiles
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Testar se as políticas funcionam
SELECT 'Políticas de admin adicionadas com sucesso!' as status;

-- 5. Instruções para testar
SELECT 'Para testar:' as instruction UNION ALL
SELECT '1. Certifique-se de estar logado como rodrigoheleno7@gmail.com' UNION ALL
SELECT '2. Acesse http://localhost:8082/admin/complaints' UNION ALL
SELECT '3. Clique em "Intermediar (Estorno)"' UNION ALL
SELECT '4. Verifique se o estorno é processado corretamente' UNION ALL
SELECT '5. Se não funcionar, verifique os logs do console';

SELECT 'Correção RLS para profiles concluída!' as status; 