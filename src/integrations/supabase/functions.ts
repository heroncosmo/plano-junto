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

// Função para buscar perfil do usuário
export async function getUserProfile() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

// Função para buscar transações do usuário
export async function getUserTransactions(limit = 50) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

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
    
    // Primeiro vamos ver TODOS os grupos para debug
    const { data: allGroups, error: allError } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) throw allError;
    
    // Vamos encontrar especificamente seus grupos
    const yourGroups = allGroups?.filter(g => 
      g.name.includes('Apple TV+') || g.name.includes('Canva Pro teste')
    );
    
    console.log('🔍 DEBUG - SEUS grupos (Apple TV+ e Canva):', yourGroups?.map(g => ({
      name: g.name,
      admin_approved: g.admin_approved,
      status: g.status,
      current_members: g.current_members,
      max_members: g.max_members,
      id: g.id
    })));
    
    // Vamos verificar cada campo individualmente
    yourGroups?.forEach(g => {
      console.log(`🔍 DEBUG - Grupo "${g.name}":`);
      console.log(`  - admin_approved: ${g.admin_approved} (deve ser true)`);
      console.log(`  - status: "${g.status}" (deve ser "active_with_slots")`);
      console.log(`  - current_members: ${g.current_members}`);
      console.log(`  - max_members: ${g.max_members}`);
    });
    
    // Vamos verificar se seus grupos estão nos 10 que passaram pelos filtros
    const filteredGroups = allGroups?.filter(g => 
      g.admin_approved === true && 
      g.status === 'active_with_slots'
    );
    
    const yourGroupsInFiltered = filteredGroups?.filter(g => 
      g.name.includes('Apple TV+') || g.name.includes('Canva Pro teste')
    );
    
    console.log('🔍 DEBUG - SEUS grupos NOS FILTRADOS:', yourGroupsInFiltered?.map(g => ({
      name: g.name,
      admin_approved: g.admin_approved,
      status: g.status,
      current_members: g.current_members,
      max_members: g.max_members
    })));
    
    console.log('🔍 DEBUG - TODOS os grupos no banco:', allGroups?.map(g => ({
      name: g.name,
      admin_approved: g.admin_approved,
      status: g.status,
      current_members: g.current_members,
      max_members: g.max_members
    })));
    
    // Buscar grupos e serviços separadamente para evitar problemas de relacionamento
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .eq('admin_approved', true)
      .eq('status', 'active_with_slots')
      .order('created_at', { ascending: false });

    if (groupsError) throw groupsError;
    
    console.log('🔍 DEBUG - Grupos encontrados na busca:', groupsData?.map(g => ({
      name: g.name,
      admin_approved: g.admin_approved,
      status: g.status,
      current_members: g.current_members,
      max_members: g.max_members,
      service_id: g.service_id
    })));

    // Se há grupos, vamos buscar os serviços para cada um
    if (groupsData && groupsData.length > 0) {
      const groupsWithServices = await Promise.all(
        groupsData.map(async (group) => {
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('id, name, category, icon_url')
            .eq('id', group.service_id)
            .single();

          if (serviceError) {
            console.error('🔍 DEBUG - Erro ao buscar serviço para grupo', group.name, ':', serviceError);
            return {
              ...group,
              services: null
            };
          }

          console.log(`🔍 DEBUG - Serviço encontrado para ${group.name}:`, serviceData);

          return {
            ...group,
            services: serviceData
          };
        })
      );

      console.log('🔍 DEBUG - Grupos finais com serviços:', groupsWithServices?.map(g => ({
        name: g.name,
        service_name: g.services?.name,
        has_service: !!g.services
      })));

      return groupsWithServices;
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
      .eq('user_id', user.user.id);

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
        status: 'active_with_slots', // Status correto para aparecer na listagem
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
  pix_key?: string;
}) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
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
      .select('id, name, admin_approved, status')
      .eq('admin_id', user.user.id)
      .or('admin_approved.eq.false,status.neq.active_with_slots');

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