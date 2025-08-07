# 🔧 CORREÇÃO: ERRO 403 EM COMPLAINT_MESSAGES

## ✅ Problema Identificado

O erro 403 ao tentar enviar mensagens de mediação é causado por políticas RLS (Row Level Security) muito restritivas na tabela `complaint_messages`. As políticas atuais só permitem que o `user_id` ou `admin_id` da reclamação insiram mensagens, mas o admin do sistema (que não é nem o `user_id` nem o `admin_id`) está tentando inserir mensagens.

## 🚀 Solução

Execute o arquivo `supabase/fix_complaint_messages_rls_for_admin.sql` no Supabase para adicionar políticas que permitam que admins do sistema acessem `complaint_messages`.

### Passos:

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o SQL**
   - Copie todo o conteúdo do arquivo `supabase/fix_complaint_messages_rls_for_admin.sql`
   - Cole no SQL Editor
   - Clique em "Run"

4. **Verifique o Resultado**
   - Você deve ver: "Correção RLS para complaint_messages concluída!"
   - As novas políticas devem aparecer na lista

## 🧪 Teste Após a Correção

1. **Acesse o painel admin**
   - Faça login como `rodrigoheleno7@gmail.com`
   - Vá para http://localhost:8082/admin/complaints

2. **Teste "Ver Reclamação"**
   - Clique em "Ver Reclamação" em qualquer reclamação
   - Verifique se o modal abre corretamente

3. **Teste Enviar Mensagem**
   - Na seção "Mediação do Sistema"
   - Digite uma mensagem no campo "Enviar mensagem de mediação"
   - Clique em "Enviar Mediação"
   - Verifique se não dá mais erro 403

4. **Teste Definir Prazo**
   - Na seção "Mediação do Sistema"
   - Selecione uma data/hora no campo "Definir novo prazo para resposta"
   - Clique em "Definir Prazo"
   - Verifique se não dá mais erro 403

## 🔍 O que Verificar

### ✅ **Após executar o SQL:**
- [ ] Mensagem de sucesso apareceu no SQL Editor
- [ ] Novas políticas aparecem na lista de políticas RLS

### ✅ **Após testar o frontend:**
- [ ] Modal "Ver Reclamação" abre sem erro
- [ ] Enviar mensagem de mediação funciona
- [ ] Definir prazo funciona
- [ ] Mensagens aparecem na conversa
- [ ] Não há mais erros 403 no console

## 🐛 Se Ainda Não Funcionar

### Problema: Ainda erro 403
- **Solução**: Verifique se você está logado como `rodrigoheleno7@gmail.com`
- **Solução**: Verifique se as políticas foram criadas corretamente

### Problema: Modal não abre
- **Solução**: Verifique se o componente `Textarea` está importado
- **Solução**: Verifique se o `useAuth` está importado

### Problema: Mensagens não aparecem
- **Solução**: Verifique se a função `loadComplaintMessages` está funcionando
- **Solução**: Verifique os logs do console para erros

## 📊 Resultado Esperado

Após executar o SQL, você deve conseguir:
- ✅ **Abrir modal** "Ver Reclamação" sem erro
- ✅ **Enviar mensagens** de mediação
- ✅ **Definir prazos** para resposta
- ✅ **Ver mensagens** na conversa
- ✅ **Sem erros 403** no console

**Execute o SQL primeiro, depois teste as funcionalidades!** 