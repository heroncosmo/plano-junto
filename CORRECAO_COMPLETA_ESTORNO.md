# 🔧 CORREÇÃO COMPLETA: ESTORNO NÃO FUNCIONA

## 🎯 Problemas Identificados

O estorno não está funcionando devido a **3 problemas principais**:

### **1. Coluna Incorreta na Função**
- ❌ Função tentava acessar `g.price` (não existe)
- ✅ Corrigido para `g.price_per_slot_cents`

### **2. Coluna Incorreta no Perfil**
- ❌ Função tentava atualizar `p.credits` (não existe)
- ✅ Corrigido para `p.balance_cents`

### **3. Políticas RLS Restritivas**
- ❌ Admin não pode atualizar perfis de outros usuários
- ❌ Admin não pode atualizar group_memberships
- ✅ Adicionadas políticas RLS para admin

## 🚀 Solução Completa

Execute **3 arquivos SQL** no Supabase na seguinte ordem:

### **Passo 1: Corrigir Função**
Execute: `supabase/fix_process_admin_refund_function_final.sql`

### **Passo 2: Corrigir Políticas RLS - Profiles**
Execute: `supabase/fix_admin_profiles_rls.sql`

### **Passo 3: Corrigir Políticas RLS - Group Memberships**
Execute: `supabase/fix_group_memberships_rls.sql`

## 📋 Como Executar

### **1. Acesse o Supabase Dashboard**
- Vá para https://supabase.com/dashboard
- Selecione seu projeto

### **2. Execute os 3 SQLs em Ordem**

#### **SQL 1: Função Corrigida**
1. Abra o SQL Editor
2. Copie conteúdo de `supabase/fix_process_admin_refund_function_final.sql`
3. Cole e execute
4. Verifique: "Função process_admin_refund corrigida com nomes corretos das colunas!"

#### **SQL 2: Políticas RLS - Profiles**
1. Nova query no SQL Editor
2. Copie conteúdo de `supabase/fix_admin_profiles_rls.sql`
3. Cole e execute
4. Verifique: "Correção RLS para profiles concluída!"

#### **SQL 3: Políticas RLS - Group Memberships**
1. Nova query no SQL Editor
2. Copie conteúdo de `supabase/fix_group_memberships_rls.sql`
3. Cole e execute
4. Verifique: "Correção RLS para group_memberships concluída!"

## 🧪 Como Testar

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

### ✅ **Após executar os 3 SQLs:**
- [ ] Função `process_admin_refund` foi recriada
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
- **Verificar**: Se todos os 3 SQLs foram executados
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

**IMPORTANTE**: Execute os 3 SQLs na ordem correta:
1. `fix_process_admin_refund_function_final.sql`
2. `fix_admin_profiles_rls.sql`
3. `fix_group_memberships_rls.sql`

**Execute todos os 3 SQLs primeiro, depois teste o estorno!** 