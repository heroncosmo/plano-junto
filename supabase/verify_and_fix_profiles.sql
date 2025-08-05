-- ========================================
-- VERIFICAÇÃO E CORREÇÃO DOS PERFIS
-- ========================================

-- 1. VERIFICAR ESTRUTURA ATUAL
-- ==============================

-- Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS DOS PERFIS
-- ===============================

-- Verificar quantos perfis temos
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as com_nome,
  COUNT(CASE WHEN cpf IS NOT NULL AND cpf != '' THEN 1 END) as com_cpf,
  COUNT(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 END) as com_telefone,
  COUNT(CASE WHEN pix_key IS NOT NULL AND pix_key != '' THEN 1 END) as com_pix
FROM public.profiles;

-- 3. VERIFICAR RELACIONAMENTO COM AUTH.USERS
-- ===========================================

-- Verificar se todos os usuários têm perfil
SELECT 
  COUNT(*) as total_users_auth,
  COUNT(p.id) as users_with_profile,
  COUNT(*) - COUNT(p.id) as users_without_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id;

-- 4. MOSTRAR EXEMPLO DE DADOS
-- =============================

-- Mostrar alguns perfis com dados
SELECT 
  p.user_id,
  p.full_name,
  au.email,
  p.cpf,
  p.phone,
  p.pix_key,
  p.balance_cents,
  p.verification_status,
  p.created_at
FROM public.profiles p
JOIN auth.users au ON p.user_id = au.id
LIMIT 5;

-- 5. VERIFICAR SE HÁ PROBLEMAS
-- =============================

-- Verificar perfis sem nome
SELECT 
  p.user_id,
  au.email,
  p.full_name,
  p.created_at
FROM public.profiles p
JOIN auth.users au ON p.user_id = au.id
WHERE p.full_name IS NULL OR p.full_name = '';

-- 6. CORREÇÃO AUTOMÁTICA (se necessário)
-- =======================================

-- Atualizar nomes vazios com email
UPDATE public.profiles 
SET full_name = COALESCE(
  full_name, 
  (SELECT SPLIT_PART(email, '@', 1) FROM auth.users WHERE id = user_id)
)
WHERE full_name IS NULL OR full_name = '';

-- 7. VERIFICAÇÃO FINAL
-- ====================

-- Verificar se a correção funcionou
SELECT 
  'Perfis com nome' as tipo,
  COUNT(*) as total
FROM public.profiles 
WHERE full_name IS NOT NULL AND full_name != ''

UNION ALL

SELECT 
  'Perfis sem nome' as tipo,
  COUNT(*) as total
FROM public.profiles 
WHERE full_name IS NULL OR full_name = '';

-- 8. TESTE DA FUNÇÃO GET_USER_EMAIL
-- ==================================

-- Testar se a função funciona
SELECT 
  'Teste função get_user_email' as status,
  get_user_email('8ddb1d9a-b400-4407-b3f4-beebbb12e141') as email_teste;

SELECT 'Verificação concluída!' as status; 