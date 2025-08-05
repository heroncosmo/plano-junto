-- ========================================
-- ADICIONAR USUÁRIO COMO ADMINISTRADOR
-- ========================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE
-- ==================================

-- Verificar se o usuário rodrigoheleno7@gmail.com existe
SELECT 
  'Verificando usuário' as status,
  COUNT(*) as total
FROM auth.users 
WHERE email = 'rodrigoheleno7@gmail.com';

-- 2. MOSTRAR DADOS DO USUÁRIO (se existir)
-- ===========================================

SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'rodrigoheleno7@gmail.com';

-- 3. VERIFICAR SE TEM PERFIL
-- ============================

SELECT 
  'Verificando perfil' as status,
  COUNT(*) as total
FROM public.profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'rodrigoheleno7@gmail.com';

-- 4. CRIAR PERFIL SE NÃO EXISTIR
-- ================================

-- Criar perfil para o usuário se não existir
INSERT INTO public.profiles (
  user_id,
  full_name,
  balance_cents,
  verification_status,
  created_at,
  updated_at
)
SELECT 
  au.id as user_id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Rodrigo Helenio') as full_name,
  0 as balance_cents,
  'pending' as verification_status,
  au.created_at,
  au.created_at as updated_at
FROM auth.users au
WHERE au.email = 'rodrigoheleno7@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = au.id
  );

-- 5. VERIFICAÇÃO FINAL
-- ====================

-- Mostrar dados completos do usuário
SELECT 
  'Dados finais do usuário' as status,
  au.id as user_id,
  au.email,
  p.full_name,
  p.balance_cents,
  p.verification_status,
  au.created_at as user_created,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.email = 'rodrigoheleno7@gmail.com';

-- 6. INSTRUÇÕES PARA O DESENVOLVEDOR
-- ====================================

SELECT 
  'INSTRUÇÕES:' as tipo,
  '1. Execute este SQL no Supabase' as instrucao
UNION ALL
SELECT 
  'INSTRUÇÕES:' as tipo,
  '2. O código já foi atualizado para incluir rodrigoheleno7@gmail.com como admin' as instrucao
UNION ALL
SELECT 
  'INSTRUÇÕES:' as tipo,
  '3. Acesse http://localhost:8081/admin com o email rodrigoheleno7@gmail.com' as instrucao
UNION ALL
SELECT 
  'INSTRUÇÕES:' as tipo,
  '4. Se o usuário não existir, crie uma conta primeiro' as instrucao;

SELECT 'Configuração de administrador concluída!' as status; 