import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CancellationWarnings {
  is_early: boolean;
  restriction_days: number;
  days_member: number;
}

export interface CancellationBenefits {
  savings_lost_formatted: string;
  benefits: Array<{
    title: string;
    description: string;
  }>;
}

export interface OpenComplaint {
  has_open_complaint: boolean;
  complaint_number?: string;
  created_at?: string;
  estimated_closure?: string;
}

export interface CancellationStep {
  currentStep: 'info' | 'reason' | 'confirmation' | 'success';
  warnings: CancellationWarnings | null;
  benefits: CancellationBenefits | null;
  earlyCancellation: CancellationWarnings | null;
  openComplaint: OpenComplaint | null;
  loading: boolean;
}

export const useCancellation = (groupId: string) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'info' | 'reason' | 'confirmation' | 'success'>('info');
  const [warnings, setWarnings] = useState<CancellationWarnings | null>(null);
  const [benefits, setBenefits] = useState<CancellationBenefits | null>(null);
  const [earlyCancellation, setEarlyCancellation] = useState<CancellationWarnings | null>(null);
  const [openComplaint, setOpenComplaint] = useState<OpenComplaint | null>(null);
  const [loading, setLoading] = useState(false);

  const resetProcess = () => {
    setCurrentStep('info');
    setWarnings(null);
    setBenefits(null);
    setEarlyCancellation(null);
    setOpenComplaint(null);
    setLoading(false);
  };

  const nextStep = () => {
    switch (currentStep) {
      case 'info':
        setCurrentStep('reason');
        break;
      case 'reason':
        setCurrentStep('confirmation');
        break;
      case 'confirmation':
        setCurrentStep('success');
        break;
      default:
        break;
    }
  };

  const previousStep = () => {
    switch (currentStep) {
      case 'reason':
        setCurrentStep('info');
        break;
      case 'confirmation':
        setCurrentStep('reason');
        break;
      default:
        break;
    }
  };

  const dismissWarning = () => {
    setWarnings(null);
  };

  const createCancellationRequest = async (data: {
    user_id: string;
    group_id: string;
    reason: string;
    description?: string;
  }) => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.rpc('process_cancellation', {
        p_user_id: data.user_id,
        p_group_id: data.group_id,
        p_reason: data.reason,
        p_description: data.description || ''
      });

      if (error) throw error;

      // Forçar refresh dos dados após cancelamento
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return { cancellation_id: result };
    } catch (error) {
      console.error('Erro ao criar solicitação de cancelamento:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmCancellation = async (cancellationId: string) => {
    setLoading(true);
    try {
      // Aqui você pode implementar a lógica de confirmação
      // Por enquanto, apenas simula o sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Erro ao confirmar cancelamento:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados de avisos e benefícios quando o modal abrir
  useEffect(() => {
    const loadCancellationData = async () => {
      if (!user || !groupId) return;

      try {
        // Verificar se há reclamação em aberto
        const { data: complaintData } = await supabase
          .from('complaints')
          .select('id, created_at')
          .eq('user_id', user.id)
          .eq('group_id', groupId)
          .in('status', ['pending', 'admin_responded', 'user_responded'])
          .single();

        if (complaintData) {
          setOpenComplaint({
            has_open_complaint: true,
            complaint_number: complaintData.id.substring(0, 8),
            created_at: complaintData.created_at,
            estimated_closure: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }

        // Verificar se é cancelamento antecipado
        const { data: membershipData } = await supabase
          .from('group_memberships')
          .select('joined_at')
          .eq('user_id', user.id)
          .eq('group_id', groupId)
          .eq('status', 'active')
          .single();

        if (membershipData) {
          const daysMember = Math.floor((Date.now() - new Date(membershipData.joined_at).getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysMember < 5) {
            setEarlyCancellation({
              is_early: true,
              restriction_days: 30,
              days_member: daysMember
            });
          }
        }

        // Simular benefícios (você pode implementar a lógica real)
        setBenefits({
          savings_lost_formatted: 'R$ 150,00',
          benefits: [
            { title: 'Acesso ao serviço premium', description: 'Você perderá acesso imediato' },
            { title: 'Economia mensal', description: 'Você economizava R$ 25,00 por mês' },
            { title: 'Comunidade ativa', description: 'Você fará falta para o grupo' }
          ]
        });

      } catch (error) {
        console.error('Erro ao carregar dados de cancelamento:', error);
      }
    };

    loadCancellationData();
  }, [user, groupId]);

  return {
    currentStep,
    warnings,
    benefits,
    earlyCancellation,
    openComplaint,
    loading,
    createCancellationRequest,
    confirmCancellation,
    dismissWarning,
    nextStep,
    previousStep,
    resetProcess
  };
};
