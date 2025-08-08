import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentPending = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !paymentId) return;

    const checkPaymentStatus = async () => {
      try {
        // Buscar pedido pelo external_payment_id
        const { data: orderData, error } = await supabase
          .from('orders')
          .select(`
            *,
            groups:group_id (
              name,
              services:service_id (name)
            )
          `)
          .eq('external_payment_id', paymentId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar pedido:', error);
          toast({ title: 'Erro', description: 'Pedido não encontrado', variant: 'destructive' });
          navigate('/');
          return;
        }

        setOrder(orderData);

        // Se já foi processado, redirecionar
        if (orderData.status === 'paid') {
          toast({ title: 'Sucesso!', description: 'Pagamento aprovado!' });
          navigate(`/payment/success/${paymentId}`);
        } else if (orderData.status === 'failed' || orderData.status === 'expired') {
          toast({ title: 'Erro', description: 'Pagamento não foi aprovado', variant: 'destructive' });
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();

    // Verificar status a cada 10 segundos
    const interval = setInterval(checkPaymentStatus, 10000);

    return () => clearInterval(interval);
  }, [user, paymentId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Pedido não encontrado</h2>
              <p className="text-gray-600 mb-4">Não foi possível encontrar informações sobre este pagamento.</p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getStatusInfo = () => {
    switch (order.status) {
      case 'pending':
        return {
          icon: <Clock className="h-8 w-8 text-yellow-500" />,
          title: 'Pagamento Pendente',
          description: 'Seu pagamento está sendo processado. Aguarde a confirmação.',
          color: 'yellow'
        };
      case 'processing':
        return {
          icon: <Clock className="h-8 w-8 text-blue-500" />,
          title: 'Pagamento em Análise',
          description: 'Seu pagamento está sendo analisado pela operadora do cartão.',
          color: 'blue'
        };
      case 'paid':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          title: 'Pagamento Aprovado',
          description: 'Seu pagamento foi aprovado com sucesso!',
          color: 'green'
        };
      default:
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          title: 'Pagamento Rejeitado',
          description: 'Seu pagamento não foi aprovado.',
          color: 'red'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                {statusInfo.icon}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {statusInfo.title}
              </h2>
              <p className="text-gray-600 mb-6">
                {statusInfo.description}
              </p>
              
              {order.status === 'processing' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Importante:</strong> Você receberá uma notificação por email quando o pagamento for aprovado. 
                    Pode fechar esta página com segurança.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Pedido</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Grupo:</span>
                  <span className="font-medium">{order.groups?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviço:</span>
                  <span className="font-medium">{order.groups?.services?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium">{formatPrice(order.amount_cents)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Método:</span>
                  <span className="font-medium">
                    {order.payment_method === 'credit_card' ? 'Cartão de Crédito' : 
                     order.payment_method === 'pix' ? 'PIX' : 'Saldo'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Data:</span>
                  <span className="font-medium">
                    {new Date(order.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                
                {order.external_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID do Pagamento:</span>
                    <span className="font-mono text-sm">{order.external_payment_id}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
            
            {order.status === 'processing' && (
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1"
              >
                Verificar Status
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentPending;
