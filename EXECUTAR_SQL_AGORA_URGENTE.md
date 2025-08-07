# 🚨 URGENTE: EXECUTAR SQL AGORA!

## 🎯 PROBLEMA CONFIRMADO

As políticas RLS **NÃO FORAM CRIADAS**! Isso explica por que o estorno não funciona.

**STATUS ATUAL:**
- ✅ Função `process_admin_refund` foi atualizada
- ❌ Políticas RLS para `profiles` NÃO foram criadas
- ❌ Políticas RLS para `group_memberships` NÃO foram criadas

## 🚀 EXECUTAR SQL AGORA

### **1. Acesse o Supabase Dashboard**
- Vá para https://supabase.com/dashboard
- Selecione seu projeto
- Clique em "SQL Editor" no menu lateral

### **2. Execute os 2 SQLs URGENTES**

#### **SQL 1: Políticas RLS - Profiles**
1. Clique em "New query"
2. Copie e cole **TODO** este código:

```sql
-- ========================================
-- CORREÇÃO: POLÍTICAS RLS PARA PROFILES
-- ========================================
-- Este script adiciona políticas RLS para permitir que
-- administradores do sistema atualizem perfis para estornos

-- 1. Verificar se RLS está habilitado na tabela profiles
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Adicionar política para administradores atualizarem perfis
CREATE POLICY "Admins can update any profile for refunds" ON profiles
FOR UPDATE
TO authenticated
USING (
  -- Permitir se o usuário é admin do sistema
  auth.jwt() ->> 'email' IN (
    'calcadosdrielle@gmail.com',
    'rodrigoheleno7@gmail.com'
  )
  OR
  -- Permitir se o usuário está atualizando seu próprio perfil
  user_id = auth.uid()
);

-- 3. Verificar todas as políticas atuais na tabela profiles
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Testar se as políticas funcionam
SELECT 'Políticas de admin adicionadas com sucesso!' as status;

-- 5. Instruções para testar
SELECT 'Para testar:' as instruction UNION ALL
SELECT '1. Certifique-se de estar logado como rodrigoheleno7@gmail.com' UNION ALL
SELECT '2. Acesse http://localhost:8082/admin/complaints' UNION ALL
SELECT '3. Clique em "Intermediar (Estorno)"' UNION ALL
SELECT '4. Verifique se o estorno é processado corretamente' UNION ALL
SELECT '5. Se não funcionar, verifique os logs do console';

SELECT 'Correção RLS para profiles concluída!' as status;
```

3. Clique em "Run"
4. **Verifique**: Deve aparecer "Correção RLS para profiles concluída!"

#### **SQL 2: Políticas RLS - Group Memberships**
1. Clique em "New query" (nova query)
2. Copie e cole **TODO** este código:

```sql
-- ========================================
-- CORREÇÃO: POLÍTICAS RLS PARA GROUP_MEMBERSHIPS
-- ========================================
-- Este script adiciona políticas RLS para permitir que
-- administradores do sistema atualizem group_memberships para estornos

-- 1. Verificar se RLS está habilitado na tabela group_memberships
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'group_memberships';

-- 2. Adicionar política para administradores atualizarem memberships
CREATE POLICY "Admins can update group memberships for refunds" ON group_memberships
FOR UPDATE
TO authenticated
USING (
  -- Permitir se o usuário é admin do sistema
  auth.jwt() ->> 'email' IN (
    'calcadosdrielle@gmail.com',
    'rodrigoheleno7@gmail.com'
  )
  OR
  -- Permitir se o usuário está atualizando sua própria membership
  user_id = auth.uid()
  OR
  -- Permitir se o usuário é admin do grupo
  EXISTS (
    SELECT 1 FROM groups 
    WHERE groups.id = group_memberships.group_id 
    AND groups.admin_id = auth.uid()
  )
);

-- 3. Verificar todas as políticas atuais na tabela group_memberships
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'group_memberships'
ORDER BY policyname;

-- 4. Testar se as políticas funcionam
SELECT 'Políticas de admin adicionadas com sucesso!' as status;

-- 5. Instruções para testar
SELECT 'Para testar:' as instruction UNION ALL
SELECT '1. Certifique-se de estar logado como rodrigoheleno7@gmail.com' UNION ALL
SELECT '2. Acesse http://localhost:8082/admin/complaints' UNION ALL
SELECT '3. Clique em "Intermediar (Estorno)"' UNION ALL
SELECT '4. Verifique se o usuário é removido do grupo' UNION ALL
SELECT '5. Se não funcionar, verifique os logs do console';

SELECT 'Correção RLS para group_memberships concluída!' as status;
```

3. Clique em "Run"
4. **Verifique**: Deve aparecer "Correção RLS para group_memberships concluída!"

## ⚠️ IMPORTANTE

- **Execute os 2 SQLs na ordem correta**
- **Não pule nenhum SQL**
- **Verifique se cada SQL executou sem erro**
- **Só teste o estorno DEPOIS de executar os 2 SQLs**

## 🧪 Como Testar Depois

### **1. Teste o Estorno**
1. **Acesse**: http://localhost:8082/admin/complaints
2. **Faça login**: Como `rodrigoheleno7@gmail.com`
3. **Clique**: "Intermediar (Estorno)" em qualquer reclamação
4. **Verifique**: Se não dá mais erro 400

### **2. Verifique o Resultado**
Após o estorno, verifique se:
- ✅ **Usuário recebeu créditos** (balance_cents aumentou)
- ✅ **Usuário foi removido do grupo** (status = 'left')
- ✅ **Reclamação foi marcada como resolvida** (status = 'resolved')
- ✅ **Transação foi criada** (tabela transactions)
- ✅ **Mensagem de sistema foi adicionada** (complaint_messages)

## 🔍 O que Verificar

### ✅ **Após executar os 2 SQLs:**
- [ ] Política "Admins can update any profile for refunds" foi criada
- [ ] Política "Admins can update group memberships for refunds" foi criada

### ✅ **Após testar o estorno:**
- [ ] Não há mais erro 400
- [ ] Estorno é processado com sucesso
- [ ] Usuário é removido do grupo
- [ ] Créditos são adicionados ao usuário
- [ ] Reclamação é marcada como resolvida

## 🐛 Se Ainda Não Funcionar

### Problema: Ainda erro 400
- **Verificar**: Se os 2 SQLs foram executados
- **Verificar**: Se não há erros no SQL

### Problema: Usuário não é removido do grupo
- **Verificar**: Se a política RLS para group_memberships foi criada
- **Verificar**: Se a tabela tem as colunas `status` e `left_at`

### Problema: Créditos não são adicionados
- **Verificar**: Se a política RLS para profiles foi criada
- **Verificar**: Se a tabela `profiles` tem a coluna `balance_cents`

## 📊 Resultado Esperado

Após a correção completa, o estorno deve:
1. ✅ **Adicionar créditos** ao usuário (balance_cents + price_per_slot_cents)
2. ✅ **Remover usuário** do grupo (status = 'left', left_at = NOW())
3. ✅ **Criar transação** de estorno (tabela transactions)
4. ✅ **Marcar reclamação** como resolvida (status = 'resolved')
5. ✅ **Adicionar mensagem** de sistema (complaint_messages)

## 🎯 Ordem de Execução

**IMPORTANTE**: Execute os 2 SQLs na ordem correta:
1. Políticas RLS - Profiles
2. Políticas RLS - Group Memberships

**Execute os 2 SQLs agora, depois teste o estorno!**
