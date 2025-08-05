# Executar Função para Buscar Email do Administrador

## 📋 **Instruções para Executar no Supabase**

### 1. **Acesse o Painel do Supabase**
- Vá para https://supabase.com
- Acesse seu projeto
- Vá para a seção "SQL Editor"

### 2. **Execute a Função SQL**
Copie e cole o seguinte SQL no editor:

```sql
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
```

### 3. **Clique em "Run"**
- Execute o SQL no painel do Supabase
- A função será criada e estará disponível para uso

### 4. **Testar a Função (Opcional)**
Para testar se a função está funcionando, execute:

```sql
-- Substitua 'user_id_aqui' pelo ID real de um usuário
SELECT get_user_email('user_id_aqui');
```

## ✅ **Resultado Esperado**

Após executar a função SQL:
- O email do administrador aparecerá na página de detalhes do grupo
- Tanto o telefone quanto o email do administrador estarão disponíveis para membros do grupo
- Os dados serão buscados corretamente do banco de dados

## 🔧 **Como Funciona**

1. **Função RPC**: A função `get_user_email` busca o email na tabela `auth.users`
2. **Segurança**: A função usa `SECURITY DEFINER` para ter permissão de acesso
3. **Frontend**: O código JavaScript chama a função via `supabase.rpc()`
4. **Resultado**: O email do administrador é retornado e exibido na interface

## 🚨 **Importante**

- A função só funciona se o usuário estiver autenticado
- O email só aparece para membros do grupo (conforme a lógica implementada)
- Se houver erro, o email ficará vazio mas não quebrará a aplicação 