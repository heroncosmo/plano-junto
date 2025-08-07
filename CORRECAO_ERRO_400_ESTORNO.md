# 🔧 CORREÇÃO: ERRO 400 NO ESTORNO

## 🎯 Problema Identificado

O erro 400 ao clicar em "Intermediar (Estorno)" é causado por um problema na função `process_admin_refund`. A função estava tentando acessar uma coluna `price` que não existe na tabela `groups`.

### **Causa do Erro:**
- Função tentava acessar `g.price` 
- Coluna correta é `g.price_per_slot_cents`
- Erro 400 = Bad Request devido a coluna inexistente

## 🚀 Solução

Execute o arquivo `supabase/fix_process_admin_refund_function.sql` no Supabase para corrigir a função.

### Passos:

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o SQL**
   - Copie todo o conteúdo do arquivo `supabase/fix_process_admin_refund_function.sql`
   - Cole no SQL Editor
   - Clique em "Run"

4. **Verifique o Resultado**
   - Você deve ver: "Função process_admin_refund corrigida com nome correto da coluna!"

## 🧪 Como Testar

### 1. **Teste o Estorno**
1. **Acesse**: http://localhost:8082/admin/complaints
2. **Faça login**: Como `rodrigoheleno7@gmail.com`
3. **Clique**: "Intermediar (Estorno)" em qualquer reclamação
4. **Verifique**: Se não dá mais erro 400

### 2. **Verifique o Resultado**
Após o estorno, verifique se:
- ✅ Usuário recebeu créditos
- ✅ Usuário foi removido do grupo
- ✅ Reclamação foi marcada como resolvida
- ✅ Mensagem de sistema foi adicionada

## 🔍 O que Verificar

### ✅ **Após executar o SQL:**
- [ ] Função `process_admin_refund` foi recriada
- [ ] Mensagem de sucesso apareceu no SQL Editor

### ✅ **Após testar o estorno:**
- [ ] Não há mais erro 400
- [ ] Estorno é processado com sucesso
- [ ] Usuário é removido do grupo
- [ ] Créditos são adicionados ao usuário

## 🐛 Se Ainda Não Funcionar

### Problema: Ainda erro 400
- **Verificar**: Se a função foi executada corretamente no Supabase
- **Verificar**: Se não há erros no SQL

### Problema: Usuário não é removido do grupo
- **Verificar**: Se a tabela `group_memberships` tem as colunas `status` e `left_at`
- **Verificar**: Se as políticas RLS permitem UPDATE

### Problema: Créditos não são adicionados
- **Verificar**: Se a tabela `profiles` tem a coluna `credits`
- **Verificar**: Se as políticas RLS permitem UPDATE

## 📊 Resultado Esperado

Após a correção, o estorno deve:
1. ✅ **Adicionar créditos** ao usuário (valor do grupo)
2. ✅ **Remover usuário** do grupo
3. ✅ **Criar transação** de estorno
4. ✅ **Marcar reclamação** como resolvida
5. ✅ **Adicionar mensagem** de sistema

**Execute o SQL primeiro, depois teste o estorno!** 