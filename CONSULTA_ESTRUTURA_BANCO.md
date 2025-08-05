# CONSULTA ESTRUTURA DO BANCO DE DADOS

## 🔍 **Consultas Necessárias para Entender a Estrutura**

Execute estas consultas no painel do Supabase para entendermos a estrutura correta:

### 1. **Estrutura da tabela `groups`**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'groups' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 2. **Estrutura da tabela `profiles`**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 3. **Estrutura da tabela `services`**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 4. **Estrutura da tabela `group_memberships`**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'group_memberships' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 5. **Verificar se a view `groups_detailed` existe**
```sql
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_name = 'groups_detailed' 
AND table_schema = 'public';
```

### 6. **Se a view existir, ver sua estrutura**
```sql
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'groups_detailed' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 7. **Testar dados reais das tabelas**
```sql
-- Ver alguns grupos
SELECT id, name, admin_id, service_id, created_at 
FROM groups 
LIMIT 3;

-- Ver alguns perfis
SELECT user_id, full_name, email, phone 
FROM profiles 
LIMIT 3;

-- Ver alguns serviços
SELECT id, name, category 
FROM services 
LIMIT 3;

-- Ver membros de um grupo específico
SELECT COUNT(*) as total_membros
FROM group_memberships 
WHERE group_id = '1b5a5f08-e984-4592-82cd-1ecb24ed8d18';
```

## 🎯 **Objetivo**

Com essas informações, poderei:
1. ✅ Entender a estrutura real das tabelas
2. ✅ Corrigir as queries do Supabase
3. ✅ Ajustar os campos e relacionamentos
4. ✅ Resolver os erros 400 e 406

**Por favor, execute essas consultas e me forneça os resultados para que eu possa corrigir as queries corretamente!** 