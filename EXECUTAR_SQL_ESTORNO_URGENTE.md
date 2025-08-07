# 🚨 URGENTE: EXECUTAR SQL PARA CORRIGIR ESTORNO

## 🎯 Problema Confirmado

O estorno não funciona porque a função ainda está usando a versão antiga com `credits` em vez de `balance_cents`. 

**ERRO CONFIRMADO**: `column "credits" does not exist`

## 🚀 SOLUÇÃO URGENTE

Você **PRECISA** executar os 3 arquivos SQL no Supabase **AGORA**:

### **1. Acesse o Supabase Dashboard**
- Vá para https://supabase.com/dashboard
- Selecione seu projeto
- Clique em "SQL Editor" no menu lateral

### **2. Execute os 3 SQLs em Ordem**

#### **SQL 1: Função Corrigida**
1. Clique em "New query"
2. Copie **TODO** o conteúdo do arquivo `supabase/fix_process_admin_refund_function_final.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. **Verifique**: Deve aparecer "Função process_admin_refund corrigida com nomes corretos das colunas!"

#### **SQL 2: Políticas RLS - Profiles**
1. Clique em "New query" (nova query)
2. Copie **TODO** o conteúdo do arquivo `supabase/fix_admin_profiles_rls.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. **Verifique**: Deve aparecer "Correção RLS para profiles concluída!"

#### **SQL 3: Políticas RLS - Group Memberships**
1. Clique em "New query" (nova query)
2. Copie **TODO** o conteúdo do arquivo `supabase/fix_group_memberships_rls.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. **Verifique**: Deve aparecer "Correção RLS para group_memberships concluída!"

## ⚠️ IMPORTANTE

- **Execute os 3 SQLs na ordem correta**
- **Não pule nenhum SQL**
- **Verifique se cada SQL executou sem erro**
- **Só teste o estorno DEPOIS de executar os 3 SQLs**

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