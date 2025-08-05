-- Adicionar campo email na tabela profiles e popular com dados dos usuários
-- Execute este SQL no Supabase para resolver o problema do email do administrador

-- 1. Adicionar campo email na tabela profiles (se não existir)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Popular o campo email com dados dos usuários
UPDATE profiles 
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = profiles.user_id
)
WHERE email IS NULL OR email = '';

-- 3. Verificar se os dados foram populados
SELECT 
  user_id, 
  full_name, 
  email, 
  phone 
FROM profiles 
WHERE email IS NOT NULL 
LIMIT 5;

-- 4. Verificar quantos perfis têm email
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(phone) as profiles_with_phone
FROM profiles; 