# Executar SQL para Adicionar Email na Tabela Profiles

## 📋 **Instruções para Executar no Supabase**

### 1. **Acesse o Painel do Supabase**
- Vá para https://supabase.com
- Acesse seu projeto
- Vá para a seção "SQL Editor"

### 2. **Execute o SQL**
Copie e cole o seguinte SQL no editor:

```sql
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
```

### 3. **Clique em "Run"**
- Execute o SQL no painel do Supabase
- O campo `email` será adicionado à tabela `profiles`
- Os emails serão populados automaticamente

### 4. **Verificar o Resultado**
Após executar, você deve ver:
- Uma tabela com os primeiros 5 perfis mostrando email e telefone
- Uma contagem de quantos perfis têm email e telefone

## ✅ **Resultado Esperado**

Após executar o SQL:
- ✅ O campo `email` será adicionado à tabela `profiles`
- ✅ Todos os emails dos usuários serão copiados da tabela `auth.users`
- ✅ O email do administrador aparecerá na página de detalhes do grupo
- ✅ Tanto telefone quanto email estarão disponíveis para membros do grupo

## 🔧 **Como Funciona**

1. **Adiciona campo**: Cria o campo `email` na tabela `profiles`
2. **Popula dados**: Copia emails da tabela `auth.users` para `profiles`
3. **Frontend**: O código busca email e telefone da mesma tabela
4. **Resultado**: Email e telefone do administrador aparecem corretamente

## 🚨 **Importante**

- Execute este SQL apenas uma vez
- Se já existir o campo `email`, não haverá erro
- Os dados serão atualizados automaticamente
- Após executar, recarregue a página para ver os resultados 