import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Complaint {
  id: string;
  user_id: string;
  group_id: string;
  admin_id: string;
  problem_type: string;
  problem_description?: string;
  desired_solution: string;
  status: string;
  created_at: string;
  admin_response_deadline: string;
  intervention_deadline: string;
  resolved_at?: string;
  closed_at?: string;
  user_contacted_admin: boolean;
  admin_contacted_user: boolean;
  group_name?: string;
  service_name?: string;
  user_name?: string;
  admin_name?: string;
  message_count?: number;
  last_message_at?: string;
}

export interface ComplaintMessage {
  id: string;
  complaint_id: string;
  user_id: string;
  message_type: string;
  message: string;
  attachments: any[];
  created_at: string;
  is_public: boolean;
  user_name?: string;
}

export interface ComplaintEvidence {
  id: string;
  complaint_id: string;
  user_id: string;
  evidence_type: string;
  title: string;
  description?: string;
  file_url?: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
}

export const useComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar reclamações do usuário
  const fetchUserComplaints = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('complaints_detailed')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComplaints(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar reclamações');
    } finally {
      setLoading(false);
    }
  };

  // Buscar reclamações como admin
  const fetchAdminComplaints = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('complaints_detailed')
        .select('*')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setComplaints(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar reclamações');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova reclamação
  const createComplaint = async (
    groupId: string,
    problemType: string,
    problemDescription: string,
    desiredSolution: string
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase.rpc('create_complaint', {
        p_user_id: user.id,
        p_group_id: groupId,
        p_problem_type: problemType,
        p_problem_description: problemDescription,
        p_desired_solution: desiredSolution
      });

      if (error) throw error;

      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar reclamação');
    }
  };

  // Adicionar mensagem à reclamação
  const addComplaintMessage = async (
    complaintId: string,
    messageType: string,
    message: string,
    attachments: any[] = []
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase.rpc('add_complaint_message', {
        p_complaint_id: complaintId,
        p_user_id: user.id,
        p_message_type: messageType,
        p_message: message,
        p_attachments: attachments
      });

      if (error) throw error;

      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao adicionar mensagem');
    }
  };

  // Buscar mensagens de uma reclamação
  const fetchComplaintMessages = async (complaintId: string): Promise<ComplaintMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('complaint_messages')
        .select(`
          *,
          profiles:user_id(name)
        `)
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(msg => ({
        ...msg,
        user_name: msg.profiles?.name
      })) || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao buscar mensagens');
    }
  };

  // Buscar evidências de uma reclamação
  const fetchComplaintEvidence = async (complaintId: string): Promise<ComplaintEvidence[]> => {
    try {
      const { data, error } = await supabase
        .from('complaint_evidence')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao buscar evidências');
    }
  };

  // Resolver reclamação
  const resolveComplaint = async (
    complaintId: string,
    resolutionType: string,
    resolutionDetails: string
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase.rpc('resolve_complaint', {
        p_complaint_id: complaintId,
        p_resolution_type: resolutionType,
        p_resolution_details: resolutionDetails
      });

      if (error) throw error;

      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao resolver reclamação');
    }
  };

  // Iniciar intervenção
  const startIntervention = async (complaintId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      const { data, error } = await supabase.rpc('start_intervention', {
        p_complaint_id: complaintId
      });

      if (error) throw error;

      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao iniciar intervenção');
    }
  };

  // Buscar estatísticas de reclamações
  const fetchComplaintStats = async () => {
    try {
      const { data, error } = await supabase
        .from('complaint_stats')
        .select('*');

      if (error) throw error;

      return data || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao buscar estatísticas');
    }
  };

  // Verificar se usuário pode criar reclamação para um grupo
  const canCreateComplaint = async (groupId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('id')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .in('status', ['pending', 'admin_responded', 'user_responded', 'intervention']);

      if (error) throw error;

      return !data || data.length === 0;
    } catch (err) {
      console.error('Erro ao verificar permissão:', err);
      return false;
    }
  };

  return {
    complaints,
    loading,
    error,
    fetchUserComplaints,
    fetchAdminComplaints,
    createComplaint,
    addComplaintMessage,
    fetchComplaintMessages,
    fetchComplaintEvidence,
    resolveComplaint,
    startIntervention,
    fetchComplaintStats,
    canCreateComplaint
  };
}; 