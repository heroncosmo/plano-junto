-- ========================================
-- CORREÇÃO: Políticas para Acesso do Admin
-- ========================================

-- Primeiro, vamos verificar o email do admin atual
-- Admin email: calcadosdrielle@gmail.com

-- 1. POLÍTICA PARA ADMIN ACESSAR TODAS AS TRANSAÇÕES
-- ===================================================

-- Remover política existente se houver
DROP POLICY IF EXISTS "Admin can view all transactions" ON public.transactions;

-- Criar política que permite admin ver todas as transações
CREATE POLICY "Admin can view all transactions" ON public.transactions
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'calcadosdrielle@gmail.com'
    OR user_id = auth.uid()
  );

-- 2. POLÍTICA PARA ADMIN ACESSAR TODOS OS PERFIS
-- ===============================================

-- Remover política existente se houver
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Criar política que permite admin ver todos os perfis
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'calcadosdrielle@gmail.com'
    OR user_id = auth.uid()
  );

-- 3. POLÍTICA PARA ADMIN ACESSAR TODOS OS SAQUES
-- ===============================================

-- Remover política existente se houver
DROP POLICY IF EXISTS "Admin can view all withdrawals" ON public.withdrawals;

-- Criar política que permite admin ver todos os saques
CREATE POLICY "Admin can view all withdrawals" ON public.withdrawals
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'calcadosdrielle@gmail.com'
    OR user_id = auth.uid()
  );

-- Política para admin processar saques
DROP POLICY IF EXISTS "Admin can update withdrawals" ON public.withdrawals;
CREATE POLICY "Admin can update withdrawals" ON public.withdrawals
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = 'calcadosdrielle@gmail.com'
    OR user_id = auth.uid()
  );

-- 4. POLÍTICA PARA ADMIN ACESSAR TODAS AS MEMBERSHIPS
-- ====================================================

-- Remover política existente se houver
DROP POLICY IF EXISTS "Admin can view all group_memberships" ON public.group_memberships;

-- Criar política que permite admin ver todas as memberships
CREATE POLICY "Admin can view all group_memberships" ON public.group_memberships
  FOR SELECT USING (
    auth.jwt() ->> 'email' = 'calcadosdrielle@gmail.com'
    OR user_id = auth.uid()
  );

-- 5. VERIFICAÇÃO DAS POLÍTICAS CRIADAS
-- =====================================

-- Listar todas as políticas das tabelas importantes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('transactions', 'profiles', 'withdrawals', 'group_memberships')
ORDER BY tablename, policyname;

-- Verificar se as tabelas têm RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('transactions', 'profiles', 'withdrawals', 'group_memberships');

-- 6. INSERIR ALGUNS DADOS DE TESTE SE NÃO EXISTIREM
-- ==================================================

-- Verificar se há transações no sistema
SELECT COUNT(*) as total_transactions FROM public.transactions;

-- Se não houver transações, criar algumas de exemplo
-- (Isso será executado apenas se não houver transações)
DO $$
DECLARE
    user_count INTEGER;
    test_user_id UUID;
BEGIN
    -- Verificar se há usuários no sistema
    SELECT COUNT(*) INTO user_count FROM auth.users;
    
    IF user_count > 0 THEN
        -- Pegar um usuário existente
        SELECT id INTO test_user_id FROM auth.users LIMIT 1;
        
        -- Verificar se já há transações
        IF NOT EXISTS (SELECT 1 FROM public.transactions LIMIT 1) THEN
            -- Inserir algumas transações de exemplo
            INSERT INTO public.transactions (
                user_id, 
                type, 
                amount_cents, 
                description, 
                payment_method, 
                status,
                created_at
            ) VALUES 
            (test_user_id, 'credit_purchase', 5000, 'Adição de créditos via PIX', 'pix', 'completed', NOW() - INTERVAL '2 days'),
            (test_user_id, 'group_payment', -2500, 'Pagamento para grupo Netflix', 'credits', 'completed', NOW() - INTERVAL '1 day'),
            (test_user_id, 'balance_adjustment', 1000, 'Ajuste de saldo administrativo', 'admin', 'completed', NOW() - INTERVAL '3 hours');
            
            RAISE NOTICE 'Transações de exemplo criadas para testes';
        END IF;
    END IF;
END $$;

SELECT 'Políticas de admin configuradas com sucesso!' as status;