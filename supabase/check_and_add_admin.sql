-- ========================================
-- VERIFICAR E ADICIONAR ADMINISTRADOR
-- ========================================

-- 1. VERIFICAR SE O USUÁRIO EXISTE
-- ==================================

-- Verificar se o usuário rodrigoheleno7@gmail.com existe
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'rodrigoheleno7@gmail.com';

-- 2. VERIFICAR SE TEM PERFIL
-- ============================

-- Verificar se o usuário tem perfil
SELECT 
  au.id as user_id,
  au.email,
  p.full_name,
  p.balance_cents,
  p.verification_status,
  p.created_at as profile_created
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE au.email = 'rodrigoheleno7@gmail.com';

-- 3. CRIAR PERFIL SE NÃO EXISTIR
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

-- 4. VERIFICAÇÃO FINAL
-- ====================

-- Verificar se tudo está correto
SELECT 
  'Usuário encontrado' as status,
  COUNT(*) as total
FROM auth.users 
WHERE email = 'rodrigoheleno7@gmail.com'

UNION ALL

SELECT 
  'Perfil criado' as status,
  COUNT(*) as total
FROM public.profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE au.email = 'rodrigoheleno7@gmail.com';

-- 5. MOSTRAR DADOS FINAIS
-- ========================

-- Mostrar dados completos do usuário
SELECT 
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

SELECT 'Verificação do administrador concluída!' as status; 