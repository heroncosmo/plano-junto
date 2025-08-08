import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CreditCard,
  QrCode,
  Wallet,
  RefreshCw,
  Calendar,
  DollarSign,
  Copy,
  ExternalLink
} from 'lucide-react';
import { formatPrice } from '@/hooks/useGroups';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Order {
  id: string;
  group_id: string;
  amount_cents: number;
  payment_method: 'pix' | 'credit_card' | 'debit_card' | 'credits';
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'expired';
  relationship: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  paid_at: string | null;
  external_payment_id: string | null;
  external_payment_data: any;
  group: {
    name: string;
    price_per_slot_cents: number;
  };
}

export default function DetalhesFatura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadOrder();
    }
  }, [id, user]);

  const loadOrder = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          group:groups(name, price_per_slot_cents)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Erro ao carregar fatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da fatura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async () => {
    if (!order || !order.external_payment_id) return;

    try {
      setUpdating(true);
      console.log('🔄 Verificando status no MercadoPago...');

      // Chamar edge function para verificar status
      const { data: mpData, error: mpError } = await supabase.functions.invoke('mercadopago-status', {
        body: { id: order.external_payment_id }
      });

      if (mpError) {
        console.error('Erro ao verificar status:', mpError);
        toast({
          title: "Erro",
          description: "Não foi possível verificar o status do pagamento",
          variant: "destructive"
        });
        return;
      }

      if (mpData?.payment) {
        const mpStatus = mpData.payment.status;
        const mpStatusDetail = mpData.payment.status_detail;
        console.log('📊 Status atual no MP:', { mpStatus, mpStatusDetail });

        // Se status mudou, processar
        if (mpStatus === 'approved' || mpStatus === 'authorized') {
          console.log('✅ Pagamento aprovado! Processando...');

          const { data: processResult, error: processError } = await supabase.rpc('process_order_payment', {
            p_order_id: order.id,
            p_external_payment_id: order.external_payment_id,
            p_external_payment_data: mpData.payment
          });

          if (!processError && processResult?.success) {
            toast({
              title: "Pagamento Aprovado!",
              description: "Seu pagamento foi aprovado! Bem-vindo ao grupo!",
            });
            // Recarregar dados
            await loadOrder();
          }
        } else if (mpStatus === 'rejected') {
          console.log('❌ Pagamento rejeitado');

          await supabase
            .from('orders')
            .update({
              status: 'failed',
              external_payment_data: mpData.payment
            })
            .eq('id', order.id);

          toast({
            title: "Pagamento Recusado",
            description: getRejectReason(mpStatusDetail),
            variant: "destructive"
          });
          // Recarregar dados
          await loadOrder();
        } else {
          toast({
            title: "Status Atualizado",
            description: `Status atual: ${getStatusText(mpStatus)}`,
          });
          // Atualizar dados localmente
          setOrder(prev => prev ? {
            ...prev,
            external_payment_data: mpData.payment
          } : null);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const refreshOrder = async () => {
    if (!id || !user || refreshing) return;

    setRefreshing(true);

    // Se for cartão em análise, verificar status no MercadoPago
    if (order?.payment_method === 'credit_card' &&
        order?.status === 'processing' &&
        order?.external_payment_id) {

      try {
        console.log('🔄 Verificando status no MercadoPago...');

        // Chamar edge function para verificar status
        const { data: mpData, error: mpError } = await supabase.functions.invoke('mercadopago-status', {
          body: { payment_id: order.external_payment_id }
        });

        if (!mpError && mpData?.payment) {
          const mpStatus = mpData.payment.status;
          console.log('📊 Status atual no MP:', mpStatus);

          // Se status mudou, processar
          if (mpStatus === 'approved' || mpStatus === 'authorized') {
            console.log('✅ Pagamento aprovado! Processando...');

            const { data: processResult, error: processError } = await supabase.rpc('process_order_payment', {
              p_order_id: order.id,
              p_external_payment_id: order.external_payment_id,
              p_external_payment_data: mpData.payment
            });

            if (!processError && processResult?.success) {
              toast({
                title: "Pagamento Aprovado!",
                description: "Seu pagamento foi aprovado! Bem-vindo ao grupo!",
              });
            }
          } else if (mpStatus === 'rejected') {
            console.log('❌ Pagamento rejeitado');

            await supabase
              .from('orders')
              .update({
                status: 'failed',
                external_payment_data: mpData.payment
              })
              .eq('id', order.id);

            toast({
              title: "Pagamento Rejeitado",
              description: "Seu pagamento foi rejeitado pelo banco",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status MP:', error);
      }
    }

    // Recarregar dados atualizados
    await loadOrder();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando Pagamento';
      case 'processing': return 'Em Análise';
      case 'paid': return 'Pago';
      case 'failed': return 'Recusado';
      case 'cancelled': return 'Cancelado';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
      case 'cancelled':
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'pix': return <QrCode className="h-5 w-5" />;
      case 'credit_card':
      case 'debit_card': return <CreditCard className="h-5 w-5" />;
      case 'credits': return <Wallet className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'credits': return 'Saldo';
      default: return method;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "ID copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar",
        variant: "destructive"
      });
    }
  };

  const getRejectReason = (statusDetail: string): string => {
    const reasons: {[key: string]: string} = {
      'cc_rejected_insufficient_amount': 'Saldo insuficiente no cartão',
      'cc_rejected_bad_filled_card_number': 'Número do cartão inválido',
      'cc_rejected_bad_filled_date': 'Data de validade inválida',
      'cc_rejected_bad_filled_security_code': 'CVV inválido',
      'cc_rejected_bad_filled_other': 'Dados do cartão incorretos',
      'cc_rejected_blacklist': 'Cartão bloqueado',
      'cc_rejected_call_for_authorize': 'Autorização necessária - entre em contato com seu banco',
      'cc_rejected_card_disabled': 'Cartão desabilitado',
      'cc_rejected_duplicated_payment': 'Pagamento duplicado',
      'cc_rejected_high_risk': 'Pagamento rejeitado por segurança',
      'cc_rejected_max_attempts': 'Muitas tentativas - tente novamente mais tarde',
      'cc_rejected_other_reason': 'Cartão rejeitado pelo banco emissor'
    };
    
    return reasons[statusDetail] || 'Pagamento não autorizado pelo banco emissor';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Fatura não encontrada</h2>
              <p className="text-gray-600 mb-4">Não foi possível encontrar os detalhes desta fatura.</p>
              <Button onClick={() => navigate('/faturas')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Faturas
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/faturas')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Detalhes da Fatura</h1>
                <p className="text-gray-600">Informações completas do pagamento</p>
              </div>
            </div>

            {/* Botão Atualizar - mostra se tiver external_payment_id */}
            {order?.external_payment_id && (order?.status === 'processing' || order?.status === 'pending') && (
              <Button
                variant="outline"
                size="sm"
                onClick={updatePaymentStatus}
                disabled={updating}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
                <span>Atualizar Status</span>
              </Button>
            )}
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-xl">{order.group?.name || 'Grupo'}</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </Badge>
                </div>
                <span className="text-2xl font-bold text-cyan-600">
                  {formatPrice(order.amount_cents)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Informações do Pagamento</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Método:</span>
                      <div className="flex items-center space-x-2">
                        {getPaymentMethodIcon(order.payment_method)}
                        <span className="font-medium">{getPaymentMethodText(order.payment_method)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Valor:</span>
                      <span className="font-medium">{formatPrice(order.amount_cents)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Relacionamento:</span>
                      <span className="font-medium capitalize">{order.relationship}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Quantidade:</span>
                      <span className="font-medium">{order.quantity} vaga(s)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Datas</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Criado em:</span>
                      <span className="font-medium">{formatDate(order.created_at)}</span>
                    </div>
                    
                    {order.paid_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Pago em:</span>
                        <span className="font-medium">{formatDate(order.paid_at)}</span>
                      </div>
                    )}
                    
                    {order.status === 'pending' && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Expira em:</span>
                        <span className="font-medium">{formatDate(order.expires_at)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Atualizado:</span>
                      <span className="font-medium">{formatDate(order.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Technical Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Informações Técnicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ID da Fatura:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {order.id.substring(0, 8)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {order.external_payment_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ID MercadoPago:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {order.external_payment_id}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(order.external_payment_id!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PIX Information */}
              {order.payment_method === 'pix' && order.external_payment_data?.point_of_interaction?.transaction_data && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Informações do PIX</h3>

                    {/* QR Code */}
                    {order.external_payment_data.point_of_interaction.transaction_data.qr_code_base64 && (
                      <div className="flex flex-col items-center space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900 mb-2">QR Code PIX</h4>
                          <img
                            src={`data:image/png;base64,${order.external_payment_data.point_of_interaction.transaction_data.qr_code_base64}`}
                            alt="QR Code PIX"
                            className="w-48 h-48 mx-auto border rounded-lg"
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            Escaneie com o app do seu banco
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Código Copia e Cola */}
                    {order.external_payment_data.point_of_interaction.transaction_data.qr_code && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Código PIX (Copia e Cola)</h4>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 text-xs bg-gray-100 p-3 rounded border break-all">
                            {order.external_payment_data.point_of_interaction.transaction_data.qr_code}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(order.external_payment_data.point_of_interaction.transaction_data.qr_code)}
                            className="flex-shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Copie e cole no app do seu banco na opção PIX
                        </p>
                      </div>
                    )}

                    {/* Prazo de Vencimento */}
                    {order.expires_at && order.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Prazo de Vencimento
                            </p>
                            <p className="text-sm text-yellow-700">
                              Este PIX expira em: {formatDate(order.expires_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Rejection Reason */}
              {order.status === 'failed' && order.external_payment_data?.status_detail && (
                <>
                  <Separator />
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">Motivo da Recusa</h4>
                        <p className="text-red-700">
                          {getRejectReason(order.external_payment_data.status_detail)}
                        </p>
                        <p className="text-xs text-red-600 mt-2">
                          Código técnico: {order.external_payment_data.status_detail}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex flex-col sm:flex-row gap-3">
                {order.status === 'failed' && (
                  <Button
                    onClick={() => navigate(`/payment/${order.group_id}?relationship=${order.relationship}`)}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Tentar Novamente</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => navigate(`/group/${order.group_id}`)}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Ver Grupo</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/faturas')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar para Faturas</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
