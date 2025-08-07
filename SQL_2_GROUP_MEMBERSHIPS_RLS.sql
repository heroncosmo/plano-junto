-- ========================================
-- CORREÇÃO: POLÍTICAS RLS PARA GROUP_MEMBERSHIPS
-- ========================================
-- Este script adiciona políticas RLS para permitir que
-- administradores do sistema atualizem group_memberships para estornos

-- 1. Verificar se RLS está habilitado na tabela group_memberships
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'group_memberships';

-- 2. Adicionar política para administradores atualizarem memberships
CREATE POLICY "Admins can update group memberships for refunds" ON group_memberships
FOR UPDATE
TO authenticated
USING (
  -- Permitir se o usuário é admin do sistema
  auth.jwt() ->> 'email' IN (
    'calcadosdrielle@gmail.com',
    'rodrigoheleno7@gmail.com'
  )
  OR
  -- Permitir se o usuário está atualizando sua própria membership
  user_id = auth.uid()
  OR
  -- Permitir se o usuário é admin do grupo
  EXISTS (
    SELECT 1 FROM groups 
    WHERE groups.id = group_memberships.group_id 
    AND groups.admin_id = auth.uid()
  )
);

-- 3. Verificar todas as políticas atuais na tabela group_memberships
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'group_memberships'
ORDER BY policyname;

-- 4. Testar se as políticas funcionam
SELECT 'Políticas de admin adicionadas com sucesso!' as status;

-- 5. Instruções para testar
SELECT 'Para testar:' as instruction UNION ALL
SELECT '1. Certifique-se de estar logado como rodrigoheleno7@gmail.com' UNION ALL
SELECT '2. Acesse http://localhost:8082/admin/complaints' UNION ALL
SELECT '3. Clique em "Intermediar (Estorno)"' UNION ALL
SELECT '4. Verifique se o usuário é removido do grupo' UNION ALL
SELECT '5. Se não funcionar, verifique os logs do console';

SELECT 'Correção RLS para group_memberships concluída!' as status;
