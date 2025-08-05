# 🚀 Sistema Completo de Cancelamento - Baseado no Kotas

## 📋 Visão Geral

Este sistema implementa um processo completo de cancelamento de grupos, baseado no fluxo do Kotas. O processo é dividido em 5 etapas principais, cada uma com validações e cálculos específicos.

## 🔄 Fluxo do Processo

### 1. **Página de Informações** (`/grupo/membro/:memberId/cancelamento/informacoes`)
- **Objetivo**: Apresentar avisos importantes sobre o cancelamento
- **Funcionalidades**:
  - Calcula dias desde que o usuário entrou no grupo
  - Verifica se há reclamação em aberto
  - Mostra avisos sobre restrições (15-30 dias)
  - Link para abrir reclamação (se < 5 dias)

### 2. **Modal de Reclamação** (`/grupo/membro/:memberId/cancelamento/reclamacao`)
- **Objetivo**: Lidar com reclamações em aberto
- **Funcionalidades**:
  - Mostra detalhes da reclamação
  - Checkbox de acordo para fechar reclamação
  - Opção de visualizar reclamação
  - Fecha reclamação automaticamente se prosseguir

### 3. **Seleção de Motivo** (`/grupo/membro/:memberId/cancelamento/motivo`)
- **Objetivo**: Coletar motivo do cancelamento
- **Funcionalidades**:
  - Dropdown com 10 motivos predefinidos
  - Mostra benefícios perdidos
  - Estatísticas de economia do usuário
  - Mensagem de incentivo para permanecer

### 4. **Confirmação Final** (`/grupo/membro/:memberId/cancelamento/confirmacao`)
- **Objetivo**: Revisar e confirmar cancelamento
- **Funcionalidades**:
  - Calcula reembolso proporcional
  - Mostra taxa de processamento (5% ou R$ 2,50 máximo)
  - Exibe restrições de participação
  - Avisos importantes sobre irreversibilidade

### 5. **Página de Sucesso** (`/grupo/membro/:memberId/cancelamento/sucesso`)
- **Objetivo**: Confirmar cancelamento realizado
- **Funcionalidades**:
  - Detalhes do cancelamento
  - Informações do reembolso
  - Data de liberação das restrições
  - Próximos passos

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. **cancellations**
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- group_id (UUID, FK para groups)
- member_id (UUID, FK para group_members)
- reason (TEXT)
- refund_amount_cents (INTEGER)
- processing_fee_cents (INTEGER)
- final_refund_cents (INTEGER)
- restriction_days (INTEGER)
- restriction_until (TIMESTAMP)
- status (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. **refunds**
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- group_id (UUID, FK para groups)
- cancellation_id (UUID, FK para cancellations)
- amount_cents (INTEGER)
- status (TEXT)
- reason (TEXT)
- pix_key (TEXT)
- processed_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 3. **user_restrictions**
```sql
- id (UUID, PK)
- user_id (UUID, FK para auth.users)
- reason (TEXT)
- restriction_type (TEXT)
- restriction_until (TIMESTAMP)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Campos Adicionados

#### **group_members**
```sql
- cancelled_at (TIMESTAMP)
- cancellation_reason (TEXT)
```

#### **complaints**
```sql
- closed_at (TIMESTAMP)
- closure_reason (TEXT)
```

## ⚙️ Funções SQL

### 1. **calculate_refund_amount(member_id, cancellation_date)**
Calcula o reembolso proporcional baseado nos dias restantes do mês.

**Lógica**:
- Dias no mês: 30
- Dias restantes = 30 - dias desde que entrou
- Reembolso = (valor_mensal / 30) × dias_restantes
- Taxa de processamento: 5% ou R$ 2,50 máximo
- Reembolso final = reembolso - taxa

### 2. **process_cancellation(member_id, reason, user_id)**
Processa o cancelamento completo.

**Ações**:
1. Calcula reembolso usando `calculate_refund_amount`
2. Cria registro em `cancellations`
3. Atualiza status do membro para 'cancelled'
4. Cria restrição de usuário (15-30 dias)
5. Cria solicitação de reembolso (se houver)

## 🎨 Interface do Usuário

### Design Minimalista
- **Cores**: Seguindo o padrão do site (azul oficial)
- **Fontes**: Pequenas, consistentes com o resto do site
- **Layout**: Cards centrados, responsivo
- **Ícones**: Lucide React (consistentes)

### Componentes Criados
1. `CancelamentoInicial.tsx` - Página de avisos
2. `CancelamentoReclamacao.tsx` - Modal de reclamação
3. `CancelamentoMotivo.tsx` - Seleção de motivo
4. `CancelamentoConfirmacao.tsx` - Confirmação final
5. `CancelamentoSucesso.tsx` - Página de sucesso

## 🔐 Segurança e Políticas RLS

### Políticas Implementadas
- Usuários só podem ver seus próprios cancelamentos
- Usuários só podem criar cancelamentos para si
- Mesmas regras para reembolsos e restrições

### Validações
- Verificação de propriedade do membro
- Validação de status do grupo
- Verificação de restrições ativas
- Cálculo correto de reembolsos

## 📊 Cálculos e Regras de Negócio

### Reembolso Proporcional
```javascript
const daysInMonth = 30;
const daysRemaining = Math.max(0, daysInMonth - daysMember);
const refundAmount = (monthlyValue / daysInMonth) * daysRemaining;
const processingFee = Math.min(refundAmount * 0.05, 2.50);
const finalRefund = Math.max(0, refundAmount - processingFee);
```

### Restrições de Participação
- **Mínimo**: 15 dias
- **Se < 5 dias no grupo**: 30 dias
- **Baseado em**: Dias desde que entrou no grupo

### Motivos de Cancelamento
1. Tive problemas no grupo
2. Não irei mais utilizar o serviço
3. A grana ta curta, vou dar uma economizada
4. Muita demora para completar o grupo
5. Falta de comunicação com o administrador
6. Problemas com o serviço de streaming
7. Motivos pessoais
8. Encontrei uma alternativa melhor
9. Problemas técnicos
10. Outros

## 🚀 Como Implementar

### 1. Execute o SQL
```bash
# Execute no painel do Supabase
SISTEMA_CANCELAMENTO_COMPLETO.sql
```

### 2. Adicione as Rotas
As rotas já estão configuradas no `App.tsx`:
```typescript
/grupo/membro/:memberId/cancelamento/informacoes
/grupo/membro/:memberId/cancelamento/reclamacao
/grupo/membro/:memberId/cancelamento/motivo
/grupo/membro/:memberId/cancelamento/confirmacao
/grupo/membro/:memberId/cancelamento/sucesso
```

### 3. Atualize o Botão de Cancelamento
O botão em `GroupDetails.tsx` já foi atualizado para redirecionar para o novo sistema.

## 🧪 Testes Recomendados

### Cenários de Teste
1. **Cancelamento normal** (usuário > 5 dias no grupo)
2. **Cancelamento precoce** (usuário < 5 dias no grupo)
3. **Cancelamento com reclamação em aberto**
4. **Cancelamento sem reembolso** (final do mês)
5. **Cancelamento com reembolso máximo** (início do mês)

### Validações
- [ ] Reembolso calculado corretamente
- [ ] Restrições aplicadas corretamente
- [ ] Reclamações fechadas automaticamente
- [ ] Dados salvos no banco
- [ ] Interface responsiva
- [ ] Validações de segurança

## 📈 Próximos Passos

### Melhorias Futuras
1. **Email de confirmação** com detalhes do cancelamento
2. **Dashboard de reembolsos** para administradores
3. **Relatórios de cancelamento** para análise
4. **Integração com PIX** para reembolsos automáticos
5. **Notificações push** sobre status do reembolso

### Monitoramento
- Logs de cancelamentos
- Métricas de retenção
- Análise de motivos de cancelamento
- Performance das funções SQL

## 🎯 Resultado Final

O sistema implementa um processo completo e profissional de cancelamento, similar ao Kotas, com:

✅ **Validações robustas**  
✅ **Cálculos precisos**  
✅ **Interface intuitiva**  
✅ **Segurança adequada**  
✅ **Rastreabilidade completa**  
✅ **Experiência do usuário otimizada**

O usuário tem controle total sobre o processo, com informações claras sobre consequências e benefícios perdidos, incentivando a permanência no grupo. 