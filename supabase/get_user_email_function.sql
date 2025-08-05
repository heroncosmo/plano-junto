-- ========================================
-- FUNÇÃO: Buscar Email do Usuário
-- ========================================

-- Função para buscar email do usuário
CREATE OR REPLACE FUNCTION get_user_email(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para permitir que admin acesse auth.users
-- (Necessário para a função funcionar)
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Teste da função
SELECT 
  'Função criada com sucesso!' as status,
  get_user_email('8ddb1d9a-b400-4407-b3f4-beebbb12e141') as email_teste; 