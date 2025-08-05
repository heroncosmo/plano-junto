import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, DollarSign, Clock, Calendar, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  status: string;
  group: {
    name: string;
    price_per_slot_cents: number;
  };
}

interface CancellationDetails {
  reason: string;
  refund_amount: number;
  processing_fee: number;
  final_refund: number;
  restriction_days: number;
  restriction_until: string;
}

const CancelamentoConfirmacao: React.FC = () => {
  const navigate = useNavigate();
  const { groupId, memberId } = useParams();
  const { user } = useAuth();
  const [member, setMember] = useState<GroupMember | null>(null);
  const [cancellationDetails, setCancellationDetails] = useState<CancellationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar dados do membership
      const { data: memberData, error: memberError } = await supabase
        .from('group_memberships')
        .select(`
          *,
          group:groups(name, price_per_slot_cents)
        `)
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);

      // Calcular detalhes do cancelamento
      const joinedDate = new Date(memberData.joined_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - joinedDate.getTime());
      const daysMember = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calcular valores (baseado no Kotas)
      const monthlyValue = (memberData.group.price_per_slot_cents || 0) / 100; // Converter centavos para reais
      const daysInMonth = 30;
      const daysRemaining = Math.max(0, daysInMonth - daysMember);
      const refundAmount = (monthlyValue / daysInMonth) * daysRemaining;
      const processingFee = Math.min(refundAmount * 0.05, 2.50); // 5% ou R$ 2,50 máximo
      const finalRefund = Math.max(0, refundAmount - processingFee);
      
      // Calcular restrição (15 dias mínimo)
      const restrictionDays = Math.max(15, daysMember < 5 ? 30 : 15);
      const restrictionDate = new Date();
      restrictionDate.setDate(restrictionDate.getDate() + restrictionDays);

      setCancellationDetails({
        reason: 'group_problems', // Simulado
        refund_amount: refundAmount,
        processing_fee: processingFee,
        final_refund: finalRefund,
        restriction_days: restrictionDays,
        restriction_until: restrictionDate.toISOString()
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!member || !cancellationDetails) return;

    try {
      setProcessing(true);

      // Chamar a função process_cancellation
      const { data: cancellationId, error } = await supabase.rpc('process_cancellation', {
        p_membership_id: memberId,
        p_reason: cancellationDetails.reason,
        p_user_id: user?.id
      });

      if (error) {
        console.error('Erro ao processar cancelamento:', error);
        throw error;
      }

      console.log('Cancelamento processado com sucesso:', cancellationId);

      // Redirecionar para sucesso
      navigate(`/grupo/membro/${memberId}/cancelamento/sucesso`);

    } catch (error) {
      console.error('Erro ao processar cancelamento:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleBack = () => {
    navigate(`/grupo/membro/${memberId}/cancelamento/motivo`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando informações...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!member || !cancellationDetails) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600">Dados não encontrados</p>
            <Button onClick={handleBack} className="mt-4">Voltar</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Confirmar Cancelamento
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Revise os detalhes antes de confirmar
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Detalhes do grupo */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Detalhes do Grupo</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Grupo:</span> {member.group.name}</p>
                                 <p><span className="font-medium">Valor Mensal:</span> {formatCurrency((member.group.price_per_slot_cents || 0) / 100)}</p>
              </div>
            </div>

            {/* Detalhes do reembolso */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-gray-800 mb-2">Detalhes do Reembolso</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Valor proporcional:</span>
                  <span className="font-medium">{formatCurrency(cancellationDetails.refund_amount)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Taxa de processamento:</span>
                  <span>-{formatCurrency(cancellationDetails.processing_fee)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Reembolso final:</span>
                  <span className="text-green-600">{formatCurrency(cancellationDetails.final_refund)}</span>
                </div>
              </div>
            </div>

            {/* Restrições */}
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-semibold mb-1">Restrição de Participação</div>
                <p className="text-sm">
                  Você ficará restrito para participar de novos grupos até{' '}
                  <span className="font-semibold">{formatDate(cancellationDetails.restriction_until)}</span>
                  {' '}({cancellationDetails.restriction_days} dias)
                </p>
              </AlertDescription>
            </Alert>

            {/* Avisos importantes */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">Avisos Importantes</h3>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex items-start">
                  <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>O cancelamento é irreversível</span>
                </div>
                <div className="flex items-start">
                  <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Você perderá acesso ao grupo imediatamente</span>
                </div>
                <div className="flex items-start">
                  <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>As taxas de processamento não são reembolsáveis</span>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleConfirmCancellation}
                disabled={processing}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
              >
                {processing ? 'Processando...' : 'Confirmar Cancelamento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
    
    <Footer />
  </div>
);
};

export default CancelamentoConfirmacao; 