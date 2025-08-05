# Sistema de Notificações - Setup

## Visão Geral

O sistema de notificações foi implementado para mostrar notificações importantes aos usuários quando clicam no sininho no topo da página. O sistema inclui:

- **Tabela de notificações** no banco de dados
- **Hook personalizado** para gerenciar notificações
- **Componente de painel** que aparece quando clica no sininho
- **Integração no Header** com contador de notificações não lidas

## Estrutura do Banco de Dados

### Tabela `notifications`
- `id`: UUID único da notificação
- `user_id`: ID do usuário que recebe a notificação
- `title`: Título da notificação
- `message`: Mensagem da notificação
- `type`: Tipo ('info', 'success', 'warning', 'error')
- `category`: Categoria ('general', 'group', 'payment', 'system')
- `is_read`: Se foi lida ou não
- `is_important`: Se é importante
- `action_url`: URL para ação quando clicado
- `action_text`: Texto do botão de ação
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Views e Funções
- `notification_stats`: View com estatísticas de notificações
- `mark_notification_as_read()`: Marca notificação como lida
- `mark_all_notifications_as_read()`: Marca todas como lidas
- `create_notification()`: Cria nova notificação

## Como Executar o Setup

### 1. Executar o SQL no Supabase

Execute o arquivo `supabase/notifications_setup.sql` no seu projeto Supabase:

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `notifications_setup.sql`
4. Execute o script

### 2. Verificar se as dependências estão instaladas

```bash
npm install date-fns
```

### 3. Testar o Sistema

Após executar o setup, você verá:

1. **Sininho no Header**: Aparece no topo da página com contador de notificações não lidas
2. **Painel de Notificações**: Abre quando clica no sininho
3. **Notificações de Exemplo**: Já estão inseridas no banco para teste

## Funcionalidades Implementadas

### ✅ Concluído
- [x] Tabela de notificações no banco
- [x] Hook `useNotifications` para gerenciar estado
- [x] Componente `NotificationPanel` com design moderno
- [x] Integração no Header com sininho e contador
- [x] Suporte mobile no menu
- [x] Marcar como lida individualmente
- [x] Marcar todas como lidas
- [x] Navegação para URLs de ação
- [x] Filtros por categoria (Todas, Importantes, Comunicação)
- [x] Formatação de datas em português
- [x] Ícones por tipo de notificação
- [x] Indicador visual de não lidas

### 🔄 Próximos Passos
- [ ] Integrar com eventos do sistema (criação de grupos, pagamentos, etc.)
- [ ] Notificações em tempo real com Supabase Realtime
- [ ] Configurações de notificação por usuário
- [ ] Notificações por email

## Como Usar

### Para Desenvolvedores

1. **Criar notificação programaticamente**:
```typescript
import { useNotifications } from '@/hooks/useNotifications';

const { createNotification } = useNotifications();

// Exemplo de uso
await createNotification(
  'Grupo aprovado!',
  'Seu grupo foi aprovado e está pronto para receber membros.',
  'success',
  'group',
  true,
  '/grupo/gerenciar',
  'Liberar grupo'
);
```

2. **Acessar estatísticas**:
```typescript
const { stats } = useNotifications();
console.log('Notificações não lidas:', stats.unread_count);
```

### Para Usuários

1. **Ver notificações**: Clique no sininho no topo da página
2. **Marcar como lida**: Clique em uma notificação
3. **Marcar todas como lidas**: Use o botão no final do painel
4. **Filtrar**: Use as abas (Todas, Importantes, Comunicação)

## Notificações de Exemplo

O sistema já vem com algumas notificações de exemplo:

1. **Grupo aprovado aguardando liberação**
2. **Reclamação finalizada**
3. **Solução apresentada para reclamação**
4. **Proposta aceita**

Estas notificações demonstram diferentes tipos e categorias do sistema.

## Design e UX

O sistema segue as melhores práticas de UX:

- **Contador visual**: Mostra número de notificações não lidas
- **Indicador de não lidas**: Ponto azul nas notificações não lidas
- **Feedback visual**: Diferentes cores por tipo de notificação
- **Responsivo**: Funciona bem em mobile e desktop
- **Acessível**: Suporte a navegação por teclado
- **Performance**: Carregamento otimizado e cache local 