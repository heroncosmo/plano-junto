import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ComplaintCheck {
  hasActiveComplaint: boolean;
  complaintId?: string;
  complaintStatus?: string;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useComplaintCheck = (groupId: string): ComplaintCheck => {
  const [hasActiveComplaint, setHasActiveComplaint] = useState(false);
  const [complaintId, setComplaintId] = useState<string | undefined>();
  const [complaintStatus, setComplaintStatus] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const checkActiveComplaint = async () => {
    if (!user || !groupId) {
      setLoading(false);
      return;
    }

    try {
      // Verificar se existe reclamação ativa para este usuário neste grupo
      const { data, error } = await supabase
        .from('complaints')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('group_id', groupId)
        .in('status', ['pending', 'admin_responded', 'user_responded'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Erro ao verificar reclamação:', error);
      }

      if (data) {
        setHasActiveComplaint(true);
        setComplaintId(data.id);
        setComplaintStatus(data.status);
      } else {
        setHasActiveComplaint(false);
        setComplaintId(undefined);
        setComplaintStatus(undefined);
      }

    } catch (error) {
      console.error('Erro ao verificar reclamação ativa:', error);
      setHasActiveComplaint(false);
    } finally {
      setLoading(false);
    }
  };

  // Verificar apenas uma vez quando o componente carrega
  useEffect(() => {
    checkActiveComplaint();
  }, [user, groupId]);

  return {
    hasActiveComplaint,
    complaintId,
    complaintStatus,
    loading,
    refetch: checkActiveComplaint
  };
};