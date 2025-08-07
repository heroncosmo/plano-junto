# 🧪 TESTE MANUAL DO ESTORNO

## 🔍 Problema Identificado

O botão "Intermediar (Estorno)" não está funcionando. Vou adicionar logs de debug para identificar o problema.

## 📋 Passos para Testar

### **1. Abra o Console do Navegador**
1. Pressione `F12` no navegador
2. Vá para a aba "Console"
3. Mantenha o console aberto

### **2. Teste o Estorno**
1. **Acesse**: http://localhost:8082/admin/complaints
2. **Faça login**: Como `rodrigoheleno7@gmail.com`
3. **Clique**: "Intermediar (Estorno)" em qualquer reclamação
4. **Observe**: Os logs no console

### **3. Logs Esperados**

Você deve ver no console:
```
🔍 DEBUG - Iniciando intervenção manual: {complaintId: "...", action: "refund"}
🔍 DEBUG - Resultado da RPC: {data: {...}, error: null}
```

### **4. Se Não Aparecer Nenhum Log**

Se não aparecer nenhum log, significa que:
- ❌ O botão não está chamando a função
- ❌ Há um erro no JavaScript
- ❌ O componente não está renderizando corretamente

### **5. Se Aparecer Erro no Console**

Se aparecer erro, me envie o erro completo para eu corrigir.

## 🔧 Teste Alternativo

Se o botão não funcionar, teste diretamente no Supabase:

### **1. Acesse o Supabase Dashboard**
- Vá para https://supabase.com/dashboard
- Selecione seu projeto
- Abra o SQL Editor

### **2. Execute o Teste**
```sql
-- Testar a função de estorno
SELECT process_admin_refund(
  '7da5bf7f-71f6-4b0d-a77f-93b7d045b844'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid
);
```

### **3. Verifique o Resultado**
- ✅ Se retornar `{"success": true, ...}` = Função funciona
- ❌ Se retornar erro = Função tem problema

## 📊 O que Verificar

### ✅ **Após o Estorno Funcionar:**
- [ ] Usuário recebeu créditos (balance_cents aumentou)
- [ ] Usuário foi removido do grupo (status = 'left')
- [ ] Reclamação foi marcada como resolvida (status = 'resolved')
- [ ] Transação foi criada (tabela transactions)
- [ ] Mensagem de sistema foi adicionada (complaint_messages)

## 🐛 Se Ainda Não Funcionar

### Problema: Não aparece log no console
- **Verificar**: Se o JavaScript está carregando
- **Verificar**: Se há erros de sintaxe

### Problema: Aparece erro no console
- **Copiar**: O erro completo
- **Enviar**: Para eu corrigir

### Problema: Função retorna erro no SQL
- **Verificar**: Se a função foi atualizada
- **Verificar**: Se as políticas RLS existem

**Teste agora e me diga o que aparece no console!**
