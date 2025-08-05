import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Home, CreditCard, Clock, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CancellationData {
  id: string;
  user_id: string;
  group_id: string;
  reason: string;
  refund_amount_cents: number;
  processing_fee_cents: number;
  final_refund_cents: number;
  restriction_days: number;
  restriction_until: string;
  created_at: string;
     group: {
     name: string;
   };
}

const CancelamentoSucesso: React.FC = () => {
  const navigate = useNavigate();
  const { groupId, memberId } = useParams();
  const { user } = useAuth();
  const [cancellation, setCancellation] = useState<CancellationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCancellationData();
  }, []);

  const loadCancellationData = async () => {
    try {
      setLoading(true);

             const { data: cancellationData, error } = await supabase
         .from('cancellations')
         .select(`
           *,
           group:groups(name)
         `)
         .eq('membership_id', memberId)
         .order('created_at', { ascending: false })
         .limit(1)
         .maybeSingle();

       if (error) {
         console.error('Erro ao buscar cancelamento:', error);
         // Se não encontrar cancelamento, criar um mock para teste
         setCancellation({
           id: 'mock-id',
           user_id: user?.id || '',
           group_id: '',
           reason: 'Teste',
           refund_amount_cents: 0,
           processing_fee_cents: 0,
           final_refund_cents: 0,
           restriction_days: 15,
           restriction_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
           created_at: new Date().toISOString(),
           group: { name: 'Grupo Teste' }
         });
       } else if (cancellationData) {
         setCancellation(cancellationData);
       }

    } catch (error) {
      console.error('Erro ao carregar dados do cancelamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleViewRefunds = () => {
    navigate('/creditos');
  };

  const handleViewGroups = () => {
    navigate('/meus-grupos');
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

  if (!cancellation) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600">Dados do cancelamento não encontrados</p>
            <Button onClick={handleGoHome} className="mt-4">Ir para o Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    const value = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Eba! xD
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Cancelamento efetuado com sucesso.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Detalhes do cancelamento */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Detalhes do Cancelamento</h3>
              <div className="space-y-2 text-sm">
                                 <div className="flex justify-between">
                   <span>Grupo:</span>
                   <span className="font-medium">{cancellation.group?.name || 'N/A'}</span>
                 </div>
                <div className="flex justify-between">
                  <span>Data/Hora:</span>
                  <span className="font-medium">{formatDateTime(cancellation.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Informações do reembolso */}
            {cancellation.final_refund_cents > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-gray-800 mb-3">Reembolso Processado</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor proporcional:</span>
                    <span className="font-medium">{formatCurrency(cancellation.refund_amount_cents)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Taxa de processamento:</span>
                    <span>-{formatCurrency(cancellation.processing_fee_cents)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Reembolso final:</span>
                    <span className="text-green-600">{formatCurrency(cancellation.final_refund_cents)}</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                  <p>O reembolso será processado em até 5 dias úteis.</p>
                </div>
              </div>
            )}

            {/* Restrições */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-gray-800 mb-3">Restrição de Participação</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                  <span>Você ficará restrito por {cancellation.restriction_days} dias</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-yellow-600" />
                  <span>Liberação em: {formatDate(cancellation.restriction_until)}</span>
                </div>
              </div>
            </div>

            {/* Próximos passos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Próximos Passos</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• Você receberá um email com os detalhes do cancelamento</p>
                <p>• O reembolso será processado automaticamente</p>
                <p>• Você pode participar de novos grupos após a liberação</p>
              </div>
            </div>

            {/* Botão principal */}
            <Button 
              onClick={handleGoHome}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              OK
            </Button>

            {/* Botões secundários */}
            <div className="flex space-x-3">
              <Button 
                onClick={handleViewRefunds}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Ver Reembolsos
              </Button>
              <Button 
                onClick={handleViewGroups}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Meus Grupos
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

export default CancelamentoSucesso; 