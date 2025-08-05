-- Função para buscar o email do administrador de forma segura
-- Esta função permite buscar o email de um usuário específico através de RPC

CREATE OR REPLACE FUNCTION get_user_email(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Buscar o email do usuário na tabela auth.users
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;
  
  RETURN user_email;
END;
$$;

-- Dar permissão para executar a função
GRANT EXECUTE ON FUNCTION get_user_email(UUID) TO authenticated;

-- Testar a função
-- SELECT get_user_email('user_id_aqui'); 