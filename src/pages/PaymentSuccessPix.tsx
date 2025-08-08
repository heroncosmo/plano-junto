import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, Clock, QrCode, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';

interface Order {
  id: string;
  amount_cents: number;
  external_payment_data: any;
  expires_at: string;
  group: {
    name: string;
  };
}

export default function PaymentSuccessPix() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          group:groups(name)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do pagamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código PIX copiado para a área de transferência",
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h1>
            <Button onClick={() => navigate('/')}>Voltar ao início</Button>
          </div>
        </main>
      </div>
    );
  }

  const qrCodeData = order.external_payment_data?.point_of_interaction?.transaction_data;
  const pixCode = qrCodeData?.qr_code;
  const qrCodeBase64 = qrCodeData?.qr_code_base64;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto p-4 py-8">
          {/* Header de Sucesso */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Quase lá! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Seu pedido foi criado com sucesso
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Complete o pagamento PIX para entrar no grupo <strong>{order.group.name}</strong>
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(order.amount_cents)}
              </div>
              <div className="text-sm text-gray-500">
                Valor do pagamento
              </div>
            </div>

            {/* QR Code */}
            {qrCodeBase64 && (
              <div className="text-center mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  Escaneie o QR Code
                </h3>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-200 inline-block">
                  <img 
                    src={`data:image/png;base64,${qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Abra o app do seu banco e escaneie o código
                </p>
              </div>
            )}

            {/* Código Copia e Cola */}
            {pixCode && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">
                  Ou copie o código PIX
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-xs bg-white p-3 rounded border break-all font-mono">
                      {pixCode}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(pixCode)}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Cole no app do seu banco na opção PIX
                  </p>
                </div>
              </div>
            )}

            {/* Prazo de Vencimento */}
            {order.expires_at && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-yellow-800">
                  <Clock className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">
                      Prazo de Vencimento
                    </p>
                    <p className="text-sm">
                      Este PIX expira em: {formatDate(order.expires_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Como pagar:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Abra o app do seu banco</li>
                <li>2. Escolha a opção PIX</li>
                <li>3. Escaneie o QR Code ou cole o código</li>
                <li>4. Confirme o pagamento</li>
                <li>5. Pronto! Você será adicionado ao grupo automaticamente</li>
              </ol>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => navigate(`/fatura/${order.id}`)}
              className="w-full"
            >
              Acompanhar Status do Pagamento
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Início</span>
            </Button>
          </div>

          {/* Nota de Segurança */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              🔒 Pagamento seguro processado pelo MercadoPago
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
