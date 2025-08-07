# 🛡️ Sistema de Mediação do Administrador

## 📋 Visão Geral

O sistema de mediação permite que o administrador do sistema (dono) intervenha em reclamações que passaram do prazo de resposta do administrador do grupo, oferecendo duas opções:

1. **Aprovar Estorno**: Devolver o valor pago pelo membro
2. **Fechar Sem Estorno**: Encerrar a reclamação sem devolução

## 🔧 Funcionalidades Implementadas

### ✅ **Nova Aba "Reclamações"**
- Localizada no painel admin: `http://localhost:8081/admin`
- Mostra todas as reclamações pendentes de mediação
- Indica reclamações vencidas com destaque visual

### ✅ **Sistema de Mediação**
- **Detecção Automática**: Reclamações que passaram do prazo são destacadas
- **Ações Disponíveis**:
  - 🔍 **Ver Grupo**: Navegar para a página do grupo
  - 👤 **Ver Membro**: Abrir detalhes completos do cliente
  - ✅ **Aprovar Estorno**: Processar reembolso automático
  - ❌ **Fechar Sem Estorno**: Encerrar sem devolução

### ✅ **Processamento Automático**
Quando o administrador aprova um estorno:

1. **Atualiza Status**: Reclamação → `resolved`
2. **Cria Cancelamento**: Registro na tabela `cancellations`
3. **Cria Reembolso**: Registro na tabela `refunds`
4. **Atualiza Saldo**: Adiciona valor ao saldo do usuário
5. **Registra Transação**: Nova transação do tipo `balance_adjustment`
6. **Cancela Membership**: Remove usuário do grupo
7. **Notifica Usuário**: Cria notificação automática

## 🗄️ Estrutura do Banco

### **Tabelas Principais**
- `complaints`: Reclamações dos usuários
- `cancellations`: Cancelamentos processados
- `refunds`: Reembolsos solicitados
- `transactions`: Histórico de transações
- `notifications`: Notificações para usuários

### **Funções SQL Criadas**
- `process_admin_refund()`: Processa estorno completo
- `close_complaint_without_refund()`: Fecha reclamação sem estorno

## 🎯 Fluxo de Mediação

### **1. Detecção de Reclamações Vencidas**
```sql
-- Reclamações que passaram do prazo
WHERE status IN ('pending', 'admin_responded', 'user_responded')
  AND NOW() > admin_response_deadline
```

### **2. Interface do Administrador**
- **Reclamações Vencidas**: Destacadas em vermelho
- **Badge "Vencida"**: Indica urgência
- **Botões de Ação**: Apenas para reclamações vencidas

### **3. Processamento de Estorno**
```typescript
// Frontend chama função SQL
const { data } = await supabase.rpc('process_admin_refund', {
  complaint_id: complaintId,
  admin_user_id: user?.id
});
```

### **4. Resultado**
- ✅ **Sucesso**: Estorno processado + notificação
- ❌ **Erro**: Mensagem detalhada do erro

## 📊 Informações Exibidas

### **Dados da Reclamação**
- 👤 **Membro**: Nome do usuário que reclamou
- 👑 **Admin do Grupo**: Nome do administrador do grupo
- 🏷️ **Tipo do Problema**: Categoria da reclamação
- 💡 **Solução Desejada**: O que o usuário quer

### **Status da Comunicação**
- 📞 **Membro contatou admin**: Se houve tentativa de contato
- 📞 **Admin contatou membro**: Se o admin respondeu
- 📅 **Criada em**: Data da reclamação
- ⏰ **Prazo admin**: Data limite para resposta

### **Destaques Visuais**
- 🔴 **Reclamações Vencidas**: Borda vermelha + fundo vermelho claro
- ⚠️ **Badge "Vencida"**: Indica urgência
- 🎯 **Botões de Ação**: Apenas para reclamações vencidas

## 🚀 Como Usar

### **1. Acessar Painel Admin**
```
http://localhost:8081/admin
```

### **2. Navegar para "Reclamações"**
- Clique na aba "Reclamações"
- Veja todas as reclamações pendentes

### **3. Analisar Reclamação**
- **Ver Grupo**: Clique em "Ver Grupo"
- **Ver Membro**: Clique em "Ver Membro"
- **Ler Descrição**: Veja o problema relatado

### **4. Tomar Decisão**
- **Aprovar Estorno**: Se o membro tem razão
- **Fechar Sem Estorno**: Se a reclamação não procede

### **5. Confirmar Ação**
- Sistema processa automaticamente
- Usuário recebe notificação
- Reclamação é marcada como resolvida

## ⚙️ Configuração

### **Executar SQLs**
1. **Primeiro**: `supabase/ admin_mediation_system.sql`
2. **Depois**: `supabase/add_admin_user.sql` (se necessário)

### **Verificar Funcionamento**
```sql
-- Verificar reclamações vencidas
SELECT COUNT(*) FROM complaints 
WHERE status IN ('pending', 'admin_responded', 'user_responded')
  AND NOW() > admin_response_deadline;
```

## 🔍 Monitoramento

### **Estatísticas Disponíveis**
- Total de reclamações por status
- Reclamações que precisam de mediação
- Histórico de estornos processados

### **Logs de Auditoria**
- Todas as ações são registradas
- Transações são rastreadas
- Notificações são enviadas

## 🛡️ Segurança

### **Validações**
- ✅ Verifica se reclamação existe
- ✅ Verifica se já foi processada
- ✅ Valida permissões do administrador
- ✅ Rollback em caso de erro

### **Transações**
- 🔄 **Atomicidade**: Tudo ou nada
- 📝 **Consistência**: Dados sempre válidos
- 🔒 **Isolamento**: Operações independentes
- 💾 **Durabilidade**: Mudanças permanentes

## 📈 Benefícios

### **Para o Sistema**
- ⚡ **Resolução Rápida**: Mediação automática
- 🛡️ **Controle Centralizado**: Administrador do sistema
- 📊 **Transparência**: Histórico completo
- 🔄 **Automatização**: Processo sem intervenção manual

### **Para os Usuários**
- 💰 **Estorno Garantido**: Quando aprovado
- 📞 **Comunicação Clara**: Notificações automáticas
- ⏰ **Resposta Rápida**: Sem esperar admin do grupo
- 🛡️ **Proteção**: Sistema justo e transparente

---

**🎉 Sistema de Mediação do Administrador Implementado com Sucesso!** 