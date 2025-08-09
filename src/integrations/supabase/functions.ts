import { supabase } from './client';

// Tipos para as respostas das funções
export interface PaymentResult {
  success: boolean;
  error?: string;
  transaction_id?: string;
  group_activated?: boolean;
}

export interface CreditResult {
  success: boolean;
  error?: string;
  new_balance?: number;
}

export interface WithdrawalResult {
  success: boolean;
  error?: string;
  withdrawal_id?: string;
}

// Função para processar pagamento de grupo
export async function processGroupPayment(
  groupId: string,
  paymentAmountCents: number,
  paymentMethod: 'credits' | 'pix' | 'credit_card' | 'debit_card'
): Promise<PaymentResult> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.rpc('process_group_payment', {
      user_uuid: user.user.id,
      group_uuid: groupId,
      payment_amount_cents: paymentAmountCents,
      payment_method_param: paymentMethod
    });

    if (error) throw error;
    
    return data as PaymentResult;
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para adicionar créditos
export async function addUserCredits(
  amountCents: number,
  paymentMethod: 'pix' | 'credit_card' | 'debit_card',
  externalPaymentId?: string
): Promise<CreditResult> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.rpc('add_user_credits', {
      user_uuid: user.user.id,
      amount_cents: amountCents,
      payment_method_param: paymentMethod,
      external_payment_id_param: externalPaymentId
    });

    if (error) throw error;
    
    return data as CreditResult;
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para solicitar saque
export async function requestWithdrawal(
  amountCents: number,
  pixKey: string
): Promise<WithdrawalResult> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.rpc('request_withdrawal', {
      user_uuid: user.user.id,
      amount_cents: amountCents,
      pix_key_param: pixKey
    });

    if (error) throw error;
    
    return data as WithdrawalResult;
  } catch (error) {
    console.error('Erro ao solicitar saque:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para processar saque (marcar como concluído)
export async function processWithdrawal(
  withdrawalId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { data, error } = await supabase.rpc('process_withdrawal', {
      withdrawal_uuid: withdrawalId
    });

    if (error) throw error;
    
    return data as { success: boolean; error?: string; message?: string };
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para buscar perfil do usuário
export async function getUserProfile() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    console.log('🔍 DEBUG - getUserProfile: Buscando perfil para usuário:', user.user.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      console.log('🔍 DEBUG - getUserProfile: Erro ao buscar perfil:', error);
      
      // Se o erro for "not found", criar um perfil básico
      if (error.code === 'PGRST116') {
        console.log('🔍 DEBUG - getUserProfile: Perfil não encontrado, criando perfil básico');
        
        const basicProfile = {
          user_id: user.user.id,
          full_name: user.user.user_metadata?.full_name || user.user.email?.split('@')[0] || '',
          cpf: '',
          phone: '',
          address_street: '',
          address_number: '',
          address_city: '',
          address_state: '',
          address_zipcode: '',
          pix_key: '',
          balance_cents: 0,
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(basicProfile)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erro ao criar perfil básico:', insertError);
          return null;
        }

        console.log('✅ Perfil básico criado com sucesso:', newProfile);
        return newProfile;
      }
      
      throw error;
    }
    
    console.log('🔍 DEBUG - getUserProfile: Perfil encontrado:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    return null;
  }
}

// Função para buscar transações do usuário
export async function getUserTransactions(limit = 50) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    // Usar RPC para contornar problemas de RLS
    const { data, error } = await supabase.rpc('get_user_transactions_rpc', {
      user_uuid: user.user.id,
      limit_count: limit
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return [];
  }
}

// Função para buscar grupos disponíveis
export async function getAvailableGroups() {
  try {
    console.log('🔍 DEBUG - Buscando grupos para listagem pública...');
    
    // Usar a view groups_detailed que já inclui o admin_name
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups_detailed')
      .select('*')
      .eq('admin_approved', true)
      .eq('owner_approved', true)
      .eq('status', 'active_with_slots')
      .order('created_at', { ascending: false });

    if (groupsError) throw groupsError;
    
    console.log('🔍 DEBUG - Grupos encontrados na busca:', groupsData?.map(g => ({
      name: g.name,
      admin_approved: g.admin_approved,
      status: g.status,
      current_members: g.current_members,
      max_members: g.max_members,
      service_name: g.service_name,
      admin_name: g.admin_name
    })));

    // Transformar os dados para o formato esperado pelo frontend
    if (groupsData && groupsData.length > 0) {
      const transformedGroups = groupsData.map(group => ({
        ...group,
        services: {
          id: group.service_id,
          name: group.service_name,
          category: group.service_category,
          icon_url: group.service_icon
        }
      }));

      console.log('🔍 DEBUG - Grupos finais transformados:', transformedGroups?.map(g => ({
        name: g.name,
        service_name: g.services?.name,
        admin_name: g.admin_name,
        has_service: !!g.services
      })));

      return transformedGroups;
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return [];
  }
}

// Função para buscar grupo por ID
export async function getGroupById(groupId: string) {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        services:service_id (
          id,
          name,
          category,
          icon_url
        ),
        group_memberships (
          id,
          user_id,
          joined_at
        )
      `)
      .eq('id', groupId)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    return null;
  }
}

// Função para buscar grupos do usuário
export async function getUserGroups() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    // Grupos onde o usuário é membro
    const { data: memberGroups, error: memberError } = await supabase
      .from('group_memberships')
      .select(`
        *,
        groups:group_id (
          *,
          services:service_id (*)
        )
      `)
      .eq('user_id', user.user.id)
      .eq('status', 'active');

    if (memberError) throw memberError;

    // Grupos onde o usuário é admin
    const { data: adminGroups, error: adminError } = await supabase
      .from('groups')
      .select(`
        *,
        services:service_id (*)
      `)
      .eq('admin_id', user.user.id);

    if (adminError) throw adminError;

    return {
      memberGroups: memberGroups || [],
      adminGroups: adminGroups || []
    };
  } catch (error) {
    console.error('Erro ao buscar grupos do usuário:', error);
    return {
      memberGroups: [],
      adminGroups: []
    };
  }
}

// Função para buscar todos os serviços
export async function getAllServices() {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('pre_approved', true)
      .order('category', { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return [];
  }
}

// Função para criar um novo grupo
export async function createGroup(groupData: {
  service_id: string;
  name: string;
  description?: string;
  rules?: string;
  relationship_type: string;
  max_members: number;
  price_per_slot_cents: number;
  instant_access?: boolean;
}) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('groups')
      .insert({
        ...groupData,
        admin_id: user.user.id,
        admin_approved: true, // Como são serviços pré-aprovados
        owner_approved: false, // Dono precisa liberar o grupo
        status: 'waiting_subscription', // Aguardando liberação do dono
        current_members: 0 // Inicializar com 0 membros
      })
      .select(`
        *,
        services:service_id (
          id,
          name,
          category,
          icon_url
        )
      `)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    throw error;
  }
}

// Função para atualizar perfil do usuário
export async function updateUserProfile(updates: {
  full_name?: string;
  cpf?: string;
  phone?: string;
  address_street?: string;
  address_number?: string;
  address_city?: string;
  address_state?: string;
  address_zipcode?: string;
}) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    console.log('🔍 DEBUG - updateUserProfile: Atualizando perfil para usuário:', user.user.id);
    console.log('🔍 DEBUG - updateUserProfile: Dados para atualizar:', updates);

    // Primeiro, tentar atualizar
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.log('🔍 DEBUG - updateUserProfile: Erro ao atualizar:', error);
      
      // Se o erro for "not found", criar um novo perfil
      if (error.code === 'PGRST116') {
        console.log('🔍 DEBUG - updateUserProfile: Perfil não encontrado, criando novo perfil');
        
        const newProfile = {
          user_id: user.user.id,
          ...updates,
          balance_cents: 0,
          verification_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erro ao criar novo perfil:', insertError);
          throw insertError;
        }

        console.log('✅ Novo perfil criado com sucesso:', createdProfile);
        return createdProfile;
      }
      
      throw error;
    }
    
    console.log('🔍 DEBUG - updateUserProfile: Perfil atualizado com sucesso:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    throw error;
  }
}

// Função para buscar estatísticas do usuário
export async function getUserStats() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return null;
  }
}

// Função para buscar saques do usuário
export async function getUserWithdrawals() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar saques:', error);
    return [];
  }
}

// Função para corrigir grupos que não estão aparecendo na listagem
export async function fixGroupVisibility(groupId: string) {
  try {
    const { data, error } = await supabase
      .from('groups')
      .update({
        admin_approved: true,
        owner_approved: true,
        status: 'active_with_slots'
      })
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    
    console.log('✅ Grupo corrigido:', data);
    return data;
  } catch (error) {
    console.error('Erro ao corrigir grupo:', error);
    throw error;
  }
}

// Função para corrigir todos os grupos do usuário que não estão aparecendo
export async function fixAllUserGroups() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    // Buscar todos os grupos do usuário que não estão visíveis
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, admin_approved, owner_approved, status')
      .eq('admin_id', user.user.id)
      .or('admin_approved.eq.false,owner_approved.eq.false,status.neq.active_with_slots');

    if (groupsError) throw groupsError;

    console.log('🔧 Grupos que precisam ser corrigidos:', groups);

    // Corrigir cada grupo
    const results = await Promise.all(
      groups?.map(group => fixGroupVisibility(group.id)) || []
    );

    console.log('✅ Todos os grupos corrigidos:', results);
    return results;
  } catch (error) {
    console.error('Erro ao corrigir grupos:', error);
    throw error;
  }
}

// Função para liberar grupo pelo dono
export async function approveGroupByOwner(groupId: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.rpc('approve_group_by_owner', {
      group_uuid: groupId,
      user_uuid: user.user.id
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erro ao liberar grupo:', error);
    throw error;
  }
}

// Função para encerrar grupo
export async function terminateGroup(
  groupId: string,
  terminationType: 'immediate' | 'scheduled',
  reason: string
) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.rpc('terminate_group', {
      group_uuid: groupId,
      admin_user_id: user.user.id,
      termination_type_param: terminationType,
      reason_param: reason
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erro ao encerrar grupo:', error);
    throw error;
  }
}

// Função para verificar se admin pode criar grupos (não está bloqueado)
export async function checkAdminRestrictions() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase.rpc('check_admin_frequent_cancellations', {
      admin_user_id: user.user.id
    });

    if (error) throw error;

    return { isBlocked: data };
  } catch (error) {
    console.error('Erro ao verificar restrições:', error);
    throw error;
  }
}

// Função para buscar histórico de cancelamentos do admin
export async function getAdminCancellationHistory() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('admin_cancellation_history')
      .select('*')
      .eq('admin_id', user.user.id)
      .order('cancellation_date', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erro ao buscar histórico de cancelamentos:', error);
    throw error;
  }
}

// FUNÇÕES ADMINISTRATIVAS
// Função para buscar todos os clientes (apenas admin)
export async function getAllClients() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

// Função para buscar todas as transações (apenas admin)
export async function getAllTransactions(limit = 100) {
  try {
    console.log('🔍 Buscando todas as transações...');
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro na query de transações:', error);
      throw error;
    }
    
    console.log('✅ Total de transações encontradas:', data?.length || 0);
    
    // Buscar dados dos perfis separadamente
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('full_name, user_id')
        .in('user_id', userIds);
      
      // Criar mapa de perfis
      const profileMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);
      
      // Adicionar dados do perfil a cada transação
      const transactionsWithProfiles = data.map(transaction => ({
        ...transaction,
        profiles: {
          full_name: profileMap[transaction.user_id]?.full_name || 'N/A',
          user_id: transaction.user_id
        }
      }));
      
      return transactionsWithProfiles;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return [];
  }
}

// Função para buscar transações de um cliente específico (apenas admin)
export async function getClientTransactions(userId: string, limit = 50) {
  try {
    console.log('🔍 Buscando transações para o cliente:', userId);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro na query de transações:', error);
      throw error;
    }
    
    console.log('✅ Transações encontradas:', data?.length || 0);
    
    // Buscar dados do perfil separadamente para evitar problemas de join
    if (data && data.length > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, user_id')
        .eq('user_id', userId)
        .single();
      
      // Adicionar dados do perfil a cada transação
      const transactionsWithProfile = data.map(transaction => ({
        ...transaction,
        profiles: {
          full_name: profile?.full_name || 'N/A',
          user_id: userId
        }
      }));
      
      return transactionsWithProfile;
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar transações do cliente:', error);
    return [];
  }
}

// Função para buscar estatísticas gerais do sistema (apenas admin)
export async function getSystemStats() {
  try {
    // Total de clientes
    const { count: totalClients } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Total de transações
    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    // Total de grupos
    const { count: totalGroups } = await supabase
      .from('groups')
      .select('*', { count: 'exact', head: true });

    // Saldo total do sistema
    const { data: balanceData } = await supabase
      .from('profiles')
      .select('balance_cents');

    const totalBalance = balanceData?.reduce((sum, profile) => sum + (profile.balance_cents || 0), 0) || 0;

    return {
      totalClients: totalClients || 0,
      totalTransactions: totalTransactions || 0,
      totalGroups: totalGroups || 0,
      totalBalance: totalBalance
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas do sistema:', error);
    return {
      totalClients: 0,
      totalTransactions: 0,
      totalGroups: 0,
      totalBalance: 0
    };
  }
}

// Função para buscar TODAS as informações de um cliente específico (apenas admin)
export async function getCompleteClientInfo(userId: string) {
  try {
    console.log('🔍 Buscando informações completas do cliente:', userId);

    // 1. Buscar perfil do cliente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      throw profileError;
    }

    // 1.1. Buscar email do usuário (se disponível)
    try {
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_email', { user_uuid: userId });
      
      if (!emailError && emailData) {
        profile.email = emailData;
      }
    } catch (error) {
      console.log('⚠️ Não foi possível buscar email do usuário:', error);
    }

    // 2. Buscar todas as transações do cliente
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('❌ Erro ao buscar transações:', transactionsError);
      throw transactionsError;
    }

    // 3. Buscar grupos onde é admin
    const { data: adminGroups, error: adminGroupsError } = await supabase
      .from('groups')
      .select(`
        *,
        services:service_id (
          name,
          category,
          icon_url
        )
      `)
      .eq('admin_id', userId)
      .order('created_at', { ascending: false });

    if (adminGroupsError) {
      console.error('❌ Erro ao buscar grupos como admin:', adminGroupsError);
    }

    // 4. Buscar grupos onde é membro (apenas membros ativos)
    const { data: memberGroups, error: memberGroupsError } = await supabase
      .from('group_memberships')
      .select(`
        *,
        groups:group_id (
          *,
          services:service_id (
            name,
            category,
            icon_url
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active') // Apenas membros ativos
      .order('joined_at', { ascending: false });

    if (memberGroupsError) {
      console.error('❌ Erro ao buscar grupos como membro:', memberGroupsError);
    }

    // 5. Buscar saques do cliente
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (withdrawalsError) {
      console.error('❌ Erro ao buscar saques:', withdrawalsError);
    }

    // 6. Calcular estatísticas do cliente
    const totalDeposited = transactions?.filter(t => ['credit_purchase', 'balance_adjustment'].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(t.amount_cents), 0) || 0;
    
    const totalSpent = transactions?.filter(t => ['group_payment', 'withdrawal', 'admin_fee'].includes(t.type))
      .reduce((sum, t) => sum + Math.abs(t.amount_cents), 0) || 0;

    const totalWithdrawn = withdrawals?.filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount_cents, 0) || 0;

    console.log('✅ Informações completas carregadas:', {
      profile: !!profile,
      transactions: transactions?.length || 0,
      adminGroups: adminGroups?.length || 0,
      memberGroups: memberGroups?.length || 0,
      withdrawals: withdrawals?.length || 0
    });

    return {
      profile,
      transactions: transactions || [],
      adminGroups: adminGroups || [],
      memberGroups: memberGroups || [],
      withdrawals: withdrawals || [],
      stats: {
        totalDeposited,
        totalSpent,
        totalWithdrawn,
        currentBalance: profile?.balance_cents || 0,
        totalGroups: (adminGroups?.length || 0) + (memberGroups?.length || 0),
        totalTransactions: transactions?.length || 0
      }
    };
  } catch (error) {
    console.error('Erro ao buscar informações completas do cliente:', error);
    throw error;
  }
}