import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Eye,
  Calendar,
  DollarSign,
  Filter,
  Download
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

export default function Faturas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const highlightOrderId = searchParams.get('highlight');

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          group:groups(name, price_per_slot_cents)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas faturas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const refreshOrders = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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
      case 'pix': return <QrCode className="h-4 w-4" />;
      case 'credit_card':
      case 'debit_card': return <CreditCard className="h-4 w-4" />;
      case 'credits': return <Wallet className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
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

  const isExpiringSoon = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffHours = (expires.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours <= 2 && diffHours > 0;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'processing'].includes(order.status);
    if (filter === 'paid') return order.status === 'paid';
    if (filter === 'failed') return ['failed', 'cancelled', 'expired'].includes(order.status);
    return true;
  });

  const getFilterCount = (filterType: string) => {
    if (filterType === 'all') return orders.length;
    if (filterType === 'pending') return orders.filter(o => ['pending', 'processing'].includes(o.status)).length;
    if (filterType === 'paid') return orders.filter(o => o.status === 'paid').length;
    if (filterType === 'failed') return orders.filter(o => ['failed', 'cancelled', 'expired'].includes(o.status)).length;
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
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
              onClick={() => navigate('/creditos')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Minhas Faturas</h1>
              <p className="text-gray-600">Histórico completo de pagamentos e tentativas</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'Todas', count: getFilterCount('all') },
                  { key: 'pending', label: 'Pendentes', count: getFilterCount('pending') },
                  { key: 'paid', label: 'Pagas', count: getFilterCount('paid') },
                  { key: 'failed', label: 'Recusadas', count: getFilterCount('failed') }
                ].map(({ key, label, count }) => (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(key)}
                    className="flex items-center space-x-1 whitespace-nowrap"
                  >
                    <span>{label}</span>
                    <Badge variant="secondary" className="ml-1">
                      {count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {filter === 'all' ? 'Nenhuma fatura encontrada' : `Nenhuma fatura ${filter === 'pending' ? 'pendente' : filter === 'paid' ? 'paga' : 'recusada'}`}
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? 'Você ainda não fez nenhum pedido.' : 'Altere o filtro para ver outras faturas.'}
                  </p>
                </div>
                {filter === 'all' && (
                  <Button onClick={() => navigate('/grupos')}>
                    Explorar Grupos
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card 
                key={order.id} 
                className={`hover:shadow-md transition-all ${
                  highlightOrderId === order.id ? 'ring-2 ring-cyan-500 shadow-lg' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-gray-900">
                            {order.group?.name || 'Grupo'}
                          </h3>
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span>{getStatusText(order.status)}</span>
                            </div>
                          </Badge>
                          {isExpiringSoon(order.expires_at) && order.status === 'pending' && (
                            <Badge variant="destructive">
                              <Clock className="h-3 w-3 mr-1" />
                              Expira em breve
                            </Badge>
                          )}
                        </div>
                        <span className="text-lg font-bold text-cyan-600">
                          {formatPrice(order.amount_cents)}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Método:</span>
                          <div className="flex items-center space-x-1 mt-1">
                            {getPaymentMethodIcon(order.payment_method)}
                            <span className="font-medium">{getPaymentMethodText(order.payment_method)}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Criado:</span>
                          <div className="font-medium mt-1">{formatDate(order.created_at)}</div>
                        </div>
                        {order.paid_at && (
                          <div>
                            <span className="text-gray-500">Pago em:</span>
                            <div className="font-medium mt-1">{formatDate(order.paid_at)}</div>
                          </div>
                        )}
                        {order.status === 'pending' && (
                          <div>
                            <span className="text-gray-500">Expira em:</span>
                            <div className="font-medium mt-1">{formatDate(order.expires_at)}</div>
                          </div>
                        )}
                      </div>

                      {/* Rejection Reason */}
                      {order.status === 'failed' && order.external_payment_data?.status_detail && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Motivo da recusa:</p>
                              <p className="text-sm text-red-700">
                                {getRejectReason(order.external_payment_data.status_detail)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-gray-500">
                          ID: {order.id.substring(0, 8)}...
                        </div>
                        <div className="flex space-x-2">
                          {order.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/payment/${order.group_id}?relationship=${order.relationship}`)}
                              className="flex items-center space-x-1"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Tentar Novamente</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/fatura/${order.id}`)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Detalhes</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Função para interpretar motivos de rejeição (duplicada aqui para uso na página)
function getRejectReason(statusDetail: string): string {
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
}
