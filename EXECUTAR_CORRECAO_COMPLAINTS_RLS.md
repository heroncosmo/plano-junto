# 🔧 CORREÇÃO URGENTE: RLS PARA COMPLAINTS

## Problema Identificado
O painel admin não está mostrando reclamações porque as políticas RLS (Row Level Security) na tabela `complaints` estão muito restritivas. Elas só permitem que usuários vejam reclamações onde são o `user_id` ou `admin_id`, mas o administrador do sistema precisa ver TODAS as reclamações para mediação.

## Solução
Execute o arquivo `supabase/fix_complaints_rls_for_admin.sql` no painel do Supabase.

### Passos:

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o SQL**
   - Copie todo o conteúdo do arquivo `supabase/fix_complaints_rls_for_admin.sql`
   - Cole no SQL Editor
   - Clique em "Run"

4. **Verifique o Resultado**
   - Você deve ver uma mensagem: "Correção RLS para complaints concluída!"
   - A nova política "Admins can view all complaints" deve aparecer na lista

## Teste Após a Correção

1. **Certifique-se de estar logado como admin**
   - Faça logout e login novamente como `rodrigoheleno7@gmail.com`

2. **Acesse o painel admin**
   - Vá para http://localhost:8082/admin/complaints
   - Verifique se as reclamações aparecem agora

3. **Verifique os logs**
   - Abra o console do navegador (F12)
   - Procure por mensagens como "📊 Reclamações encontradas: X"

## Se Ainda Não Funcionar

Se após executar o SQL as reclamações ainda não aparecerem:

1. **Verifique se está logado como admin**
   ```javascript
   // No console do navegador, execute:
   console.log('Email atual:', supabase.auth.getUser().then(u => u.data.user?.email));
   ```

2. **Teste a query diretamente**
   - No SQL Editor do Supabase, execute:
   ```sql
   SELECT * FROM complaints WHERE status NOT IN ('closed', 'resolved');
   ```

3. **Verifique as políticas RLS**
   ```sql
   SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'complaints';
   ```

## Resultado Esperado
Após executar o SQL, o painel admin deve mostrar:
- ✅ Reclamações ativas (não fechadas)
- ✅ Reclamações vencidas (destacadas em laranja)
- ✅ Reclamações prontas para intervenção (destacadas em vermelho)
- ✅ Estatísticas corretas no topo da página

**Execute este SQL AGORA para resolver o problema!** 