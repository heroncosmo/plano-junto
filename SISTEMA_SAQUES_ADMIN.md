# Sistema de Saques - Dashboard do Admin

## Visão Geral

O sistema de saques foi implementado no dashboard do admin para permitir que você gerencie as solicitações de saque dos usuários. Quando um cliente solicita um saque, ele aparece no dashboard do admin para que você possa fazer a transferência manualmente e marcar como concluída.

## Como Funciona

### 1. Solicitação de Saque pelo Cliente
- O cliente acessa a página "Sacar Créditos"
- Informa o valor e a chave PIX
- A solicitação é criada com status "pending"

### 2. Aparência no Dashboard do Admin
- As solicitações pendentes aparecem na aba "Saques Pendentes"
- Cada card mostra:
  - Valor do saque
  - Nome do solicitante
  - Chave PIX
  - Data da solicitação
  - Botão "Marcar como Concluído"

### 3. Processamento pelo Admin
- Você faz a transferência PIX manualmente
- Clica em "Marcar como Concluído"
- O status muda para "completed"
- O saque aparece na aba "Saques Concluídos"

## Funcionalidades Implementadas

### Dashboard do Admin
- **Nova aba "Saques Pendentes"**: Lista todos os saques com status "pending"
- **Nova aba "Saques Concluídos"**: Histórico dos saques processados
- **Card de Saque**: Exibe todas as informações necessárias para processar
- **Botão de Conclusão**: Marca o saque como concluído após a transferência

### Informações Exibidas
- **Valor**: Valor solicitado em reais
- **Solicitante**: Nome do usuário que pediu o saque
- **ID do Usuário**: Para identificação única
- **Chave PIX**: Chave para fazer a transferência
- **Data da Solicitação**: Quando foi solicitado
- **Data do Processamento**: Quando foi concluído (após processar)

### Status dos Saques
- **pending**: Aguardando processamento
- **completed**: Saque concluído e transferido

## Como Usar

### 1. Acessar o Dashboard
- Faça login como admin (email: calcadosdrielle@gmail.com)
- Acesse o painel de administração

### 2. Verificar Saques Pendentes
- Clique na aba "Saques Pendentes"
- Veja todos os saques que precisam ser processados

### 3. Processar um Saque
- Identifique o saque que deseja processar
- Anote a chave PIX e o valor
- Faça a transferência PIX manualmente
- Clique em "Marcar como Concluído"
- Confirme a ação

### 4. Verificar Histórico
- Clique na aba "Saques Concluídos"
- Veja todos os saques já processados

## Arquivos Modificados

### Frontend
- `src/pages/AdminPanel.tsx`: Adicionadas abas e funcionalidades de saque
- `src/integrations/supabase/functions.ts`: Nova função `processWithdrawal`

### Backend
- `supabase/step1_functions.sql`: Função `process_withdrawal` adicionada
- `supabase/process_withdrawal_function.sql`: Arquivo SQL separado com a função

## Executar as Funções SQL

Para que o sistema funcione, você precisa executar a função SQL no Supabase:

1. Acesse o painel do Supabase
2. Vá para SQL Editor
3. Execute o conteúdo do arquivo `supabase/process_withdrawal_function.sql`

## Logs e Rastreamento

O sistema mantém logs detalhados:
- **Data de solicitação**: Quando o cliente pediu o saque
- **Data de processamento**: Quando você marcou como concluído
- **Status**: Para acompanhar o progresso
- **Transações**: Vinculadas às transações do usuário

## Benefícios

1. **Controle Total**: Você tem controle sobre quando e como processar os saques
2. **Rastreabilidade**: Histórico completo de todos os saques
3. **Segurança**: Transferência manual garante que você confirme antes de processar
4. **Organização**: Interface clara separando pendentes e concluídos
5. **Eficiência**: Informações completas para processar rapidamente

## Próximos Passos

1. Execute a função SQL no Supabase
2. Teste o sistema fazendo uma solicitação de saque
3. Processe o saque pelo dashboard do admin
4. Verifique se aparece corretamente na aba de concluídos

O sistema está pronto para uso e vai facilitar muito o gerenciamento dos saques dos usuários! 