# 🔧 Resolver Problema com Saques no Dashboard do Admin

## ❗ Problema Identificado
Os saques solicitados pelos clientes não estão aparecendo no dashboard do administrador.

## 🧐 Possíveis Causas
1. **Função SQL não executada** - A função `process_withdrawal` pode não estar no banco
2. **Políticas RLS muito restritivas** - O admin pode não ter permissão para ver todos os saques
3. **Tabela withdrawals não configurada** - A estrutura pode estar incorreta

## ✅ Solução Passo a Passo

### 1. **Execute o SQL de Correção**
Acesse o painel do Supabase e execute o arquivo `supabase/fix_withdrawal_policies.sql`:

```sql
-- Esta consulta vai criar/corrigir:
-- ✓ Função process_withdrawal
-- ✓ Políticas RLS para admin ver todos os saques
-- ✓ Permissões para admin atualizar saques
```

### 2. **Teste o Sistema**

#### **Passo 1: Fazer um Saque como Cliente**
1. Abra o site em modo incógnito ou outra aba
2. Faça login como cliente normal (não admin)
3. Acesse "Créditos" → "Sacar Créditos"
4. Solicite um saque qualquer

#### **Passo 2: Verificar no Dashboard do Admin**
1. Faça login como admin (calcadosdrielle@gmail.com)
2. Acesse o "Painel de Administração"
3. Clique na aba "Saques Pendentes"
4. **O saque deve aparecer aqui!**

### 3. **Verificar os Logs**
Abra o console do navegador (F12) e procure por:
- 🔍 `"Carregando saques pendentes..."`
- 📋 `"Saques pendentes encontrados:"`
- ❌ Se houver erros, eles aparecerão aqui

### 4. **Se Ainda Não Funcionar**

#### **Opção A: Verificar Dados no Banco**
Execute estas queries no Supabase SQL Editor:

```sql
-- Verificar se existem saques
SELECT COUNT(*) FROM public.withdrawals;

-- Ver todos os saques
SELECT * FROM public.withdrawals ORDER BY created_at DESC;

-- Verificar função
SELECT proname FROM pg_proc WHERE proname = 'process_withdrawal';
```

#### **Opção B: Inserir Saque de Teste**
```sql
-- Inserir saque de teste (substitua user_id por um ID real)
INSERT INTO public.withdrawals (user_id, amount_cents, pix_key, status)
VALUES ('SEU_USER_ID_AQUI', 1000, 'teste@email.com', 'pending');
```

### 5. **Logs Adicionados para Debug**
Adicionei logs no código para facilitar o debug:
- `src/pages/AdminPanel.tsx` - Logs ao carregar saques
- `src/pages/SacarCreditos.tsx` - Logs ao solicitar saque

## 🎯 Resultado Esperado
Após executar o SQL de correção:
1. ✅ Saques aparecerão no dashboard do admin
2. ✅ Admin poderá marcar como concluído
3. ✅ Histórico de saques funcionará

## 🚨 Problemas Comuns

### **"Função não encontrada"**
- Execute `supabase/fix_withdrawal_policies.sql`

### **"Permissão negada"**
- As políticas RLS serão corrigidas pelo SQL

### **"Tabela não existe"**
- Verifique se as migrações foram executadas

### **Saques não aparecem**
- Verifique os logs no console
- Confirme que o email do admin está correto

## 📞 Próximos Passos
1. **Execute o SQL de correção**
2. **Teste fazendo um saque**
3. **Verifique no dashboard do admin**
4. **Remova os logs se tudo estiver funcionando**

O sistema deve funcionar perfeitamente após esses passos! 🎉