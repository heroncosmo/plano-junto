-- Script para criar perfis para usuários existentes que não têm um perfil
-- Execute este script no Supabase SQL Editor

-- Primeiro, vamos ver quais usuários não têm perfil
SELECT 
  au.id as user_id,
  au.email,
  au.raw_user_meta_data,
  CASE WHEN p.id IS NULL THEN 'SEM PERFIL' ELSE 'COM PERFIL' END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- Agora vamos criar perfis para usuários que não têm
INSERT INTO public.profiles (
  user_id,
  full_name,
  cpf,
  phone,
  address_street,
  address_number,
  address_city,
  address_state,
  address_zipcode,
  pix_key,
  balance_cents,
  verification_status,
  created_at,
  updated_at
)
SELECT 
  au.id as user_id,
  COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as full_name,
  '' as cpf,
  '' as phone,
  '' as address_street,
  '' as address_number,
  '' as address_city,
  '' as address_state,
  '' as address_zipcode,
  '' as pix_key,
  0 as balance_cents,
  'pending' as verification_status,
  au.created_at,
  au.created_at as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- Verificar se todos os usuários agora têm perfil
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profile,
  COUNT(*) - COUNT(p.id) as users_without_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id; 