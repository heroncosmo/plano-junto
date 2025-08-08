import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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
  DollarSign
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

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
    monthly_fee_cents: number;
  };
}

export default function MeusPedidos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          group:groups(name, monthly_fee_cents)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
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
      case 'failed': return 'Falhou';
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

  const viewOrderDetails = (order: Order) => {
    navigate(`/pedido/${order.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
              <p className="text-gray-600">Acompanhe o status dos seus pagamentos</p>
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

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600">Você ainda não fez nenhum pedido.</p>
                </div>
                <Button onClick={() => navigate('/grupos')}>
                  Explorar Grupos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
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

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-gray-500">
                          ID: {order.id.substring(0, 8)}...
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewOrderDetails(order)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Ver Detalhes</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
