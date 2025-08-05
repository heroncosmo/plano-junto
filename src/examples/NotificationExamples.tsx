import { useNotifications } from '@/hooks/useNotifications';

// Exemplo de como integrar notificações em diferentes eventos do sistema
export const NotificationExamples = () => {
  const { createNotification } = useNotifications();

  // Exemplo 1: Grupo aprovado pelo admin
  const handleGroupApproved = async (groupId: string, groupName: string) => {
    await createNotification(
      'Grupo aprovado!',
      `Seu grupo "${groupName}" foi aprovado e está pronto para receber membros.`,
      'success',
      'group',
      true,
      `/grupo/${groupId}/gerenciar`,
      'Liberar grupo'
    );
  };

  // Exemplo 2: Pagamento confirmado
  const handlePaymentConfirmed = async (amount: number, groupName: string) => {
    await createNotification(
      'Pagamento confirmado!',
      `Seu pagamento de R$ ${(amount / 100).toFixed(2)} para o grupo "${groupName}" foi confirmado.`,
      'success',
      'payment',
      false,
      '/creditos',
      'Ver créditos'
    );
  };

  // Exemplo 3: Novo membro no grupo
  const handleNewMember = async (memberName: string, groupName: string) => {
    await createNotification(
      'Novo membro no grupo!',
      `${memberName} se juntou ao grupo "${groupName}".`,
      'info',
      'group',
      false,
      `/group/${groupId}`,
      'Ver grupo'
    );
  };

  // Exemplo 4: Reclamação criada
  const handleComplaintCreated = async (complaintId: string, groupName: string) => {
    await createNotification(
      'Nova reclamação criada',
      `Uma reclamação foi criada no grupo "${groupName}". Acompanhe o progresso.`,
      'warning',
      'system',
      true,
      `/reclamacao/${complaintId}`,
      'Ver reclamação'
    );
  };

  // Exemplo 5: Créditos adicionados
  const handleCreditsAdded = async (amount: number) => {
    await createNotification(
      'Créditos adicionados!',
      `${(amount / 100).toFixed(2)} créditos foram adicionados à sua conta.`,
      'success',
      'payment',
      false,
      '/creditos',
      'Ver saldo'
    );
  };

  // Exemplo 6: Grupo liberado
  const handleGroupReleased = async (groupName: string) => {
    await createNotification(
      'Grupo liberado!',
      `O grupo "${groupName}" foi liberado e agora pode receber membros.`,
      'success',
      'group',
      true,
      `/group/${groupId}`,
      'Ver grupo'
    );
  };

  // Exemplo 7: Erro no pagamento
  const handlePaymentError = async (groupName: string) => {
    await createNotification(
      'Erro no pagamento',
      `Houve um problema com o pagamento para o grupo "${groupName}". Tente novamente.`,
      'error',
      'payment',
      true,
      '/payment',
      'Tentar novamente'
    );
  };

  // Exemplo 8: Lembrete de fidelidade
  const handleFidelityReminder = async (groupName: string, daysLeft: number) => {
    await createNotification(
      'Lembrete de fidelidade',
      `O grupo "${groupName}" expira em ${daysLeft} dias. Renove para continuar.`,
      'warning',
      'group',
      true,
      `/group/${groupId}/renovar`,
      'Renovar grupo'
    );
  };

  return null; // Este componente é apenas para exemplos
};

// Exemplo de uso em componentes reais:

/*
// No componente de criação de grupo
const handleCreateGroup = async (groupData) => {
  try {
    const result = await createGroup(groupData);
    
    // Criar notificação de grupo criado
    await createNotification(
      'Grupo criado com sucesso!',
      `Seu grupo "${groupData.name}" foi criado e está em análise.`,
      'success',
      'group',
      true,
      `/grupo/${result.id}/gerenciar`,
      'Gerenciar grupo'
    );
    
  } catch (error) {
    // Notificação de erro
    await createNotification(
      'Erro ao criar grupo',
      'Houve um problema ao criar seu grupo. Tente novamente.',
      'error',
      'group',
      true
    );
  }
};

// No componente de pagamento
const handlePayment = async (paymentData) => {
  try {
    const result = await processPayment(paymentData);
    
    // Notificação de pagamento confirmado
    await createNotification(
      'Pagamento confirmado!',
      `Seu pagamento de R$ ${(paymentData.amount / 100).toFixed(2)} foi processado.`,
      'success',
      'payment',
      false,
      '/transacoes',
      'Ver transação'
    );
    
  } catch (error) {
    // Notificação de erro no pagamento
    await createNotification(
      'Erro no pagamento',
      'Houve um problema com seu pagamento. Verifique os dados e tente novamente.',
      'error',
      'payment',
      true,
      '/payment',
      'Tentar novamente'
    );
  }
};

// No componente de admin para aprovação de grupos
const handleApproveGroup = async (groupId, groupName) => {
  try {
    await approveGroup(groupId);
    
    // Notificação para o admin
    await createNotification(
      'Grupo aprovado',
      `O grupo "${groupName}" foi aprovado com sucesso.`,
      'success',
      'group',
      false
    );
    
    // Notificação para o criador do grupo
    await createNotification(
      'Seu grupo foi aprovado!',
      `O grupo "${groupName}" foi aprovado e está pronto para ser liberado.`,
      'success',
      'group',
      true,
      `/grupo/${groupId}/gerenciar`,
      'Liberar grupo'
    );
    
  } catch (error) {
    await createNotification(
      'Erro ao aprovar grupo',
      'Houve um problema ao aprovar o grupo. Tente novamente.',
      'error',
      'group',
      true
    );
  }
};
*/ 