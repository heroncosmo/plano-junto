# 🚀 Executar Sistema de Notificações

## Passo 1: Executar SQL no Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Cole o código SQL corrigido**
   - Abra o arquivo `supabase/notifications_setup.sql` (versão atualizada)
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase

4. **Execute o script**
   - Clique no botão "Run" (▶️)
   - Aguarde a execução completa
   - ✅ Não deve dar erro de foreign key

## Passo 2: Verificar Dependências

```bash
npm install date-fns
```

## Passo 3: Testar o Sistema

1. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

2. **Acesse a aplicação**
   - Vá para http://localhost:5173
   - Faça login com um usuário

3. **Verifique o sininho**
   - No topo da página, você verá um sininho (🔔)
   - Na primeira vez que fizer login, as notificações de exemplo serão criadas automaticamente
   - Se houver notificações não lidas, aparecerá um contador vermelho

4. **Clique no sininho**
   - O painel de notificações abrirá
   - Você verá as notificações de exemplo (criadas automaticamente)
   - Teste os filtros (Todas, Importantes, Comunicação)

## Passo 4: Testar Funcionalidades

### ✅ Testar Marcar como Lida
1. Clique em uma notificação
2. Ela deve ficar com fundo cinza (lida)
3. O contador deve diminuir

### ✅ Testar Marcar Todas como Lidas
1. Clique no botão "Marcar todas como lidas"
2. Todas as notificações devem ficar marcadas como lidas
3. O contador deve zerar

### ✅ Testar Navegação
1. Clique em uma notificação com ação
2. Deve navegar para a página correspondente
3. O painel deve fechar automaticamente

### ✅ Testar Filtros
1. Clique nas abas "Importantes" e "Comunicação"
2. As notificações devem ser filtradas corretamente
3. Os contadores devem atualizar

## Passo 5: Verificar no Banco de Dados

1. **No Supabase Dashboard**
   - Vá para "Table Editor"
   - Procure pela tabela "notifications"
   - As notificações serão criadas automaticamente quando o usuário fizer login

2. **Verificar View**
   - Procure pela view "notification_stats"
   - Verifique se as estatísticas estão corretas

## Estrutura Criada

### Tabelas
- ✅ `notifications` - Armazena as notificações
- ✅ `notification_stats` - View com estatísticas

### Funções
- ✅ `mark_notification_as_read()` - Marca como lida
- ✅ `mark_all_notifications_as_read()` - Marca todas como lidas
- ✅ `create_notification()` - Cria nova notificação

### Componentes
- ✅ `NotificationPanel` - Painel de notificações
- ✅ `useNotifications` - Hook para gerenciar notificações
- ✅ Integração no Header com sininho
- ✅ Criação automática de notificações de exemplo

## Notificações de Exemplo

As notificações de exemplo são criadas automaticamente quando o usuário faz login pela primeira vez:

1. **"Bem-vindo ao JuntaPlay!"** - Tipo: success, Categoria: general
2. **"Como funciona o JuntaPlay?"** - Tipo: info, Categoria: general
3. **"Adicione créditos para participar"** - Tipo: info, Categoria: payment

## Próximos Passos

Após o setup, você pode:

1. **Integrar com eventos do sistema**
   - Criar notificações quando grupos são aprovados
   - Notificar sobre pagamentos confirmados
   - Alertar sobre novos membros

2. **Adicionar notificações em tempo real**
   - Usar Supabase Realtime
   - Atualizar contador automaticamente

3. **Personalizar notificações**
   - Configurar preferências por usuário
   - Adicionar notificações por email

## Troubleshooting

### ❌ Erro: "relation notifications does not exist"
- Execute novamente o SQL no Supabase
- Verifique se não há erros de sintaxe

### ❌ Erro: "function create_notification does not exist"
- Execute novamente o SQL no Supabase
- Verifique se todas as funções foram criadas

### ❌ Erro: "insert or update on table notifications violates foreign key constraint"
- ✅ **CORRIGIDO**: O SQL atualizado não insere notificações com user_id inexistente
- As notificações são criadas automaticamente quando o usuário faz login

### ❌ Sininho não aparece
- Verifique se o usuário está logado
- Confirme se o hook `useNotifications` está sendo usado
- Verifique se não há erros no console

### ❌ Contador não atualiza
- Verifique se a view `notification_stats` foi criada
- Confirme se as políticas RLS estão corretas
- Verifique se o usuário tem permissão para ver suas notificações

### ❌ Notificações de exemplo não aparecem
- Faça logout e login novamente
- Verifique se o usuário tem um perfil na tabela `profiles`
- Verifique o console do navegador para erros

## Sucesso! 🎉

Se tudo funcionou corretamente, você terá:

- ✅ Sininho no Header com contador
- ✅ Painel de notificações funcional
- ✅ Notificações de exemplo criadas automaticamente
- ✅ Sistema de marcar como lida funcionando
- ✅ Filtros por categoria funcionando
- ✅ Navegação para ações funcionando

O sistema está pronto para ser integrado com os eventos do seu aplicativo! 