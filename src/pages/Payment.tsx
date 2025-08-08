import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ChevronDown,
  HelpCircle,
  Plus,
  Minus,
  Info,
  Wallet
} from 'lucide-react';
import { useGroupById, formatPrice } from '@/hooks/useGroups';
import { getUserProfile, processGroupPayment } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type PaymentMethod = 'balance' | 'pix' | 'card';

type MPayer = {
  email: string;
  first_name?: string;
  last_name?: string;
  identification?: { type: 'CPF' | 'CNPJ'; number: string };
};

declare global {
  interface Window {
    Mercadopago?: any;
    MercadoPago?: any;
  }
}

const Payment = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('balance');
  const [showMoreMethods, setShowMoreMethods] = useState(false);

  const [showPixModal, setShowPixModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // PIX state
  const [pixQrBase64, setPixQrBase64] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Card state
  const [mpPublicKey, setMpPublicKey] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState(''); // MM/AA
  const [cvv, setCvv] = useState('');
  const [docNumber, setDocNumber] = useState(''); // CPF
  const [payingCard, setPayingCard] = useState(false);

  const relationship = searchParams.get('relationship') || 'familia';
  const { group, loading, error } = useGroupById(id || '');

  // Carregar saldo real do usuário
  useEffect(() => {
    const loadUserBalance = async () => {
      try {
        setLoadingBalance(true);
        const profile = await getUserProfile();
        if (profile) {
          setUserBalance(profile.balance_cents || 0);
          if (profile.cpf && !docNumber) setDocNumber(profile.cpf);
        }
      } catch (error) {
        console.error('Erro ao carregar saldo:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu saldo.",
          variant: "destructive",
        });
      } finally {
        setLoadingBalance(false);
      }
    };

    const loadPublicKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('public-config');
        if (!error && data?.mpPublicKey) setMpPublicKey(data.mpPublicKey);
      } catch (e) {
        console.warn('Não foi possível carregar a Public Key do MP. Cartão ficará indisponível.', e);
      }
    };

    if (user) {
      loadUserBalance();
      loadPublicKey();
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [user, toast]);

  const monthlyFee = group?.price_per_slot_cents || 6750; // R$ 67,50
  const deposit = monthlyFee;
  const total = monthlyFee + deposit;
  const pixFee = 68; // R$ 0,68
  const cardFee = 150; // R$ 1,50

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const startPixPolling = async (paymentId: string, orderId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        // Verificar status do pedido no banco (pode ter sido processado por webhook ou cron)
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError) {
          console.error('Erro ao verificar pedido:', orderError);
          return;
        }

        if (orderData.status === 'paid') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          toast({ title: 'Sucesso!', description: 'Pagamento aprovado via PIX.' });
          setShowPixModal(false);
          setTimeout(() => {
            navigate(`/payment/success/${paymentId}`);
          }, 800);
          return;
        }

        if (orderData.status === 'failed' || orderData.status === 'expired') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          toast({ title: 'Erro', description: 'Pagamento não foi aprovado ou expirou', variant: 'destructive' });
          setShowPixModal(false);
          return;
        }

        // Se ainda está pendente, verificar no MercadoPago também
        const { data, error } = await supabase.functions.invoke('mercadopago-status', { body: { id: paymentId } });
        if (error) throw error;

        const status = data?.payment?.status;
        if (status === 'approved' || status === 'authorized') {
          if (pollingRef.current) clearInterval(pollingRef.current);

          // Processar o pedido
          const { data: processResult, error: processError } = await supabase.rpc('process_order_payment', {
            p_order_id: orderId,
            p_external_payment_id: paymentId,
            p_external_payment_data: data.payment
          });

          if (processError || !processResult?.success) {
            console.error('Erro ao processar pedido:', processError || processResult);
            toast({ title: 'Erro', description: 'Falha ao processar pagamento', variant: 'destructive' });
          } else {
            toast({ title: 'Sucesso!', description: 'Pagamento aprovado via PIX.' });
            setShowPixModal(false);
            setTimeout(() => {
              navigate(`/payment/success/${paymentId}`);
            }, 800);
          }
        }
      } catch (e) {
        console.error('Erro no polling do PIX:', e);
      }
    }, 10000); // Reduzido para 10 segundos já que webhook é principal
  };

  async function loadMpScript(): Promise<void> {
    if (window.Mercadopago || window.MercadoPago) return;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Falha ao carregar SDK Mercado Pago'));
      document.body.appendChild(script);
    });
  }

  async function createCardToken(): Promise<string> {
    if (!mpPublicKey) throw new Error('Public Key do Mercado Pago não configurada');
    await loadMpScript();

    // v1 SDK
    if (!window.Mercadopago) throw new Error('SDK Mercado Pago indisponível');
    window.Mercadopago.setPublishableKey(mpPublicKey);

    // Validar campos obrigatórios
    if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 13) {
      throw new Error('Número do cartão inválido');
    }
    if (!cardName || cardName.trim().length < 2) {
      throw new Error('Nome no cartão é obrigatório');
    }
    if (!cvv || cvv.length < 3) {
      throw new Error('CVV inválido');
    }
    if (!docNumber || docNumber.replace(/\D/g, '').length !== 11) {
      throw new Error('CPF inválido');
    }

    const [expMonth, expYearShort] = (expiry || '').split('/').map(s => s.trim());
    if (!expMonth || !expYearShort || expMonth.length !== 2 || expYearShort.length !== 2) {
      throw new Error('Validade inválida (use MM/AA)');
    }

    const expYear = `20${expYearShort}`;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (parseInt(expYear) < currentYear ||
        (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
      throw new Error('Cartão vencido');
    }

    console.log('Criando token com dados:', {
      cardNumber: cardNumber.replace(/\s+/g, '').substring(0, 6) + '...',
      cardholderName: cardName,
      expirationMonth: expMonth,
      expirationYear: expYear,
      identificationType: 'CPF',
      identificationNumber: docNumber.replace(/\D/g, '').substring(0, 3) + '...'
    });

    return new Promise<string>((resolve, reject) => {
      window.Mercadopago.createToken({
        cardNumber: cardNumber.replace(/\s+/g, ''),
        cardholderName: cardName.trim(),
        securityCode: cvv,
        identificationType: 'CPF',
        identificationNumber: docNumber.replace(/\D/g, ''),
        expirationMonth: expMonth,
        expirationYear: expYear,
      }, (status: number, response: any) => {
        console.log('MercadoPago token response:', { status, response });
        if (status === 200 || status === 201) {
          resolve(response.id);
        } else {
          console.error('Erro ao criar token:', response);
          reject(new Error(response?.message || response?.cause?.[0]?.description || 'Falha ao tokenizar cartão'));
        }
      });
    });
  }

  const handlePayment = async () => {
    if (!group || !user) return;
    setProcessing(true);

    try {
      if (paymentMethod === 'pix') {
        // 1. Criar pedido no sistema
        const { data: orderData, error: orderError } = await supabase.rpc('create_order', {
          p_user_id: user.id,
          p_group_id: group.id,
          p_amount_cents: monthlyFee,
          p_payment_method: 'pix',
          p_relationship: searchParams.get('relationship') || 'familia',
          p_quantity: quantity
        });

        if (orderError || !orderData?.success) {
          console.error('Erro ao criar pedido:', orderError || orderData);
          toast({ title: 'Erro', description: orderData?.error || 'Falha ao criar pedido', variant: 'destructive' });
          throw new Error('Falha ao criar pedido');
        }

        // 2. Criar cobrança PIX no MercadoPago
        const payer: MPayer = {
          email: user.email || 'user@example.com',
          first_name: user.user_metadata?.full_name || 'Usuario',
          last_name: 'JuntaPlay',
        };

        const { data, error } = await supabase.functions.invoke('mercadopago-create', {
          body: {
            type: 'pix',
            amountCents: monthlyFee,
            description: `Assinatura do grupo ${group.name}`,
            payer,
            externalReference: `ORDER_${orderData.order_id}`,
          },
        });

        if (error || data?.error || !data?.success) {
          console.error('PIX create error:', error || data);
          const detail = data?.mpError?.message || data?.mpError?.error || data?.error || error?.message || 'Erro desconhecido';
          toast({ title: 'Erro ao criar PIX', description: String(detail), variant: 'destructive' });
          throw new Error('Falha ao criar PIX');
        }

        // 3. Atualizar pedido com ID do MercadoPago
        await supabase
          .from('orders')
          .update({
            external_payment_id: data.payment?.id?.toString(),
            external_payment_data: data.payment,
            status: 'processing'
          })
          .eq('id', orderData.order_id);

        const qr = data.payment?.point_of_interaction?.transaction_data;
        setPaymentId(data.payment?.id?.toString() || null);
        setPixQrBase64(qr?.qr_code_base64 || null);
        setPixCode(qr?.qr_code || null);
        setShowPixModal(true);

        // 4. Configurar polling como backup (webhook é principal)
        if (data.payment?.id) startPixPolling(String(data.payment.id), orderData.order_id);
        setProcessing(false);
        return; // aguardará aprovação do PIX via webhook ou polling
      }

      if (paymentMethod === 'card') {
        // Card form is now shown inline, no need for modal
        setProcessing(false);
        return;
      }

      // Pagamento com saldo (créditos)
      const { data: orderData, error: orderError } = await supabase.rpc('create_order', {
        p_user_id: user.id,
        p_group_id: group.id,
        p_amount_cents: monthlyFee,
        p_payment_method: 'credits',
        p_relationship: searchParams.get('relationship') || 'familia',
        p_quantity: quantity
      });

      if (orderError || !orderData?.success) {
        console.error('Erro ao criar pedido:', orderError || orderData);
        toast({ title: 'Erro', description: orderData?.error || 'Falha ao processar pagamento', variant: 'destructive' });
      } else {
        toast({ title: 'Sucesso!', description: 'Pagamento processado com sucesso!' });
        setTimeout(() => {
          navigate(`/payment/success/credits`);
        }, 1000);
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      toast({ title: 'Erro', description: 'Erro inesperado ao processar pagamento', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handlePayCard = async () => {
    if (!group || !user) return;
    try {
      setPayingCard(true);

      // 1. Criar pedido no sistema
      const { data: orderData, error: orderError } = await supabase.rpc('create_order', {
        p_user_id: user.id,
        p_group_id: group.id,
        p_amount_cents: monthlyFee,
        p_payment_method: 'credit_card',
        p_relationship: searchParams.get('relationship') || 'familia',
        p_quantity: quantity
      });

      if (orderError || !orderData?.success) {
        console.error('Erro ao criar pedido:', orderError || orderData);
        toast({ title: 'Erro', description: orderData?.error || 'Falha ao criar pedido', variant: 'destructive' });
        throw new Error('Falha ao criar pedido');
      }

      // 2. Criar token do cartão
      const token = await createCardToken();

      const payer = {
        email: user.email || 'user@example.com',
        first_name: user.user_metadata?.full_name || 'Usuario',
        last_name: 'JuntaPlay',
        identification: { type: 'CPF', number: (docNumber || '').replace(/\D/g, '') },
      };

      // 3. Criar pagamento no MercadoPago
      const { data, error } = await supabase.functions.invoke('mercadopago-create', {
        body: {
          type: 'card',
          amountCents: monthlyFee,
          description: `Assinatura do grupo ${group.name}`,
          payer,
          token,
          installments: 1,
          externalReference: `ORDER_${orderData.order_id}`,
        },
      });

      if (error || data?.error || !data?.success) {
        console.error('Erro ao criar pagamento:', error || data);
        throw new Error(error?.message || data?.error || 'Falha ao criar pagamento com cartão');
      }

      // 4. Atualizar pedido com dados do pagamento
      await supabase
        .from('orders')
        .update({
          external_payment_id: data.payment?.id?.toString(),
          external_payment_data: data.payment,
          status: 'processing'
        })
        .eq('id', orderData.order_id);

      // 5. Verificar se foi aprovado imediatamente
      const paymentStatus = data.payment?.status;
      if (paymentStatus === 'approved' || paymentStatus === 'authorized') {
        // Processar o pedido imediatamente
        const { data: processResult, error: processError } = await supabase.rpc('process_order_payment', {
          p_order_id: orderData.order_id,
          p_external_payment_id: data.payment?.id?.toString(),
          p_external_payment_data: data.payment
        });

        if (processError || !processResult?.success) {
          throw new Error(processResult?.error || 'Falha ao processar pagamento');
        }

        toast({ title: 'Sucesso!', description: 'Pagamento aprovado via Cartão.' });
        setTimeout(() => navigate(`/payment/success/${data.payment?.id}`), 800);
      } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
        // Pagamento em análise
        toast({ title: 'Pagamento em análise', description: 'Seu pagamento está sendo processado. Você receberá uma notificação quando for aprovado.' });
        setTimeout(() => navigate(`/payment/pending/${data.payment?.id}`), 800);
      } else {
        // Pagamento rejeitado
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('id', orderData.order_id);

        throw new Error('Pagamento rejeitado pelo cartão');
      }
    } catch (e: any) {
      console.error('Erro no pagamento com cartão:', e);
      toast({ title: 'Erro no cartão', description: e?.message || 'Falha ao processar pagamento', variant: 'destructive' });
    } finally {
      setPayingCard(false);
    }
  };

  const handleBack = () => {
    navigate(`/join-group/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Erro</h1>
        <p className="text-gray-600 mb-4">Não foi possível carregar os dados do grupo.</p>
        <Button onClick={() => navigate('/')}>Voltar para o Início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Panel - Payment Summary */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Resumo do Pagamento</h2>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Group and Service Info */}
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.services?.name || 'Serviço não disponível'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">Cota</span>
                        <p className="text-sm font-medium text-gray-900">{group.current_members}/{group.max_members}</p>
                      </div>
                    </div>
                  </div>

                  {/* JuntaPlay Quantity */}
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium text-gray-900">JuntaPlay</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="w-6 h-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= 10}
                        className="w-6 h-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Monthly Fee */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Mensalidade</span>
                    <span className="font-medium text-gray-900">{formatPrice(monthlyFee)}</span>
                  </div>

                  {/* Deposit */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Caução</span>
                    <span className="font-medium text-gray-900">{formatPrice(deposit)}</span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">{formatPrice(total * quantity)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods - Show when card is NOT selected */}
            {paymentMethod !== 'card' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Forma de Pagamento</h2>

                <Card>
                  <CardContent className="p-4 space-y-4">

                    {/* Payment Methods */}
                    <div className="space-y-3">
                      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>

                        {/* Balance/Saldo */}
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <RadioGroupItem value="balance" id="balance" />
                          <Label htmlFor="balance" className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Wallet className="h-4 w-4 text-gray-600" />
                                <span className="font-medium text-gray-900">Saldo</span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-gray-900">{formatPrice(userBalance)}</span>
                                <span className="text-green-600 text-xs block">Sem acréscimos</span>
                              </div>
                            </div>
                          </Label>
                        </div>

                        {/* PIX */}
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix" className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">PIX</span>
                              <span className="text-red-600 text-xs">+ {formatPrice(pixFee)}</span>
                            </div>
                          </Label>
                        </div>

                        {/* Credit Card */}
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                          <RadioGroupItem value="card" id="card" disabled={!mpPublicKey} />
                          <Label htmlFor="card" className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">Cartão de Crédito</span>
                              <span className="text-red-600 text-xs">+ {formatPrice(cardFee)}</span>
                            </div>
                            {!mpPublicKey && (
                              <div className="text-[11px] text-red-600 mt-1">Indisponível: configure a Public Key no Admin.</div>
                            )}
                          </Label>
                        </div>
                      </RadioGroup>

                      {/* Show More Methods Button */}
                      <Button
                        variant="ghost"
                        onClick={() => setShowMoreMethods(!showMoreMethods)}
                        className="text-cyan-600 hover:text-cyan-700 p-0 h-auto text-xs"
                      >
                        Ver mais formas de pagamento
                        <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${showMoreMethods ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>

                    {/* Coupon */}
                    <div className="text-center pt-2">
                      <Input
                        placeholder="Tem um cupom?"
                        className="text-center border-gray-300 text-sm"
                      />
                    </div>

                    {/* Finalizar Button - Positioned below coupon */}
                    <div className="pt-4">
                      <Button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
                      >
                        {processing ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Processando...</span>
                          </div>
                        ) : (
                          `Finalizar Pagamento ${formatPrice(total * quantity)}`
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other Payment Methods - Show when card IS selected */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPaymentMethod('balance')}
                    className="text-cyan-600 hover:text-cyan-700 p-0 h-auto text-sm font-medium"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Outras formas de pagamento
                  </Button>
                </div>

                <Card className="border-l-4 border-l-cyan-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900 text-sm">Outras opções disponíveis:</h3>

                      {/* Balance/Saldo - Compact */}
                      <div
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-cyan-300 transition-colors"
                        onClick={() => setPaymentMethod('balance')}
                      >
                        <div className="flex items-center space-x-2">
                          <Wallet className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Saldo</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">{formatPrice(userBalance)}</span>
                          <span className="text-green-600 text-xs block">Sem acréscimos</span>
                        </div>
                      </div>

                      {/* PIX - Compact */}
                      <div
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-cyan-300 transition-colors"
                        onClick={() => setPaymentMethod('pix')}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">PIX</span>
                        </div>
                        <div className="text-right">
                          <span className="text-red-600 text-xs">+ {formatPrice(pixFee)}</span>
                          <span className="text-gray-500 text-xs block">Instantâneo</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Panel - Card Form when card is selected, or empty when not */}
          <div className="space-y-4">
            {paymentMethod === 'card' ? (
              <>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-cyan-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Dados do Cartão</h2>
                </div>

                <Card className="border-t-4 border-t-cyan-500">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-4">
                      {/* Card Number */}
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                        />
                      </div>

                      {/* Card Name */}
                      <div>
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input
                          id="cardName"
                          placeholder="Nome como está no cartão"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                        />
                      </div>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Validade</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/AA"
                            value={expiry}
                            onChange={e => setExpiry(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="000"
                            value={cvv}
                            onChange={e => setCvv(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* CPF */}
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          placeholder="000.000.000-00"
                          value={docNumber}
                          onChange={e => setDocNumber(e.target.value)}
                        />
                      </div>

                      {/* Coupon */}
                      <div>
                        <Input
                          placeholder="Tem um cupom?"
                          className="text-center border-gray-300 text-sm"
                        />
                      </div>

                      {/* Payment Summary for Card */}
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">{formatPrice(total * quantity)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Taxa do cartão:</span>
                            <span className="text-red-600">+ {formatPrice(cardFee)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-base border-t pt-2">
                            <span>Total:</span>
                            <span className="text-cyan-600">{formatPrice(total * quantity + cardFee)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Button */}
                      <div className="pt-2">
                        <Button
                          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                          onClick={handlePayCard}
                          disabled={payingCard || !mpPublicKey}
                        >
                          {payingCard ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Processando pagamento...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <CreditCard className="h-4 w-4" />
                              <span>Finalizar Pagamento</span>
                            </div>
                          )}
                        </Button>

                        {!mpPublicKey && (
                          <p className="text-xs text-red-600 text-center mt-2">
                            Cartão indisponível: configure a chave pública no painel administrativo
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center space-y-3">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Selecione uma forma de pagamento</p>
                    <p className="text-xs text-gray-500 mt-1">Escolha como deseja pagar ao lado</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PIX Modal */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Pagamento PIX</h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                {pixQrBase64 ? (
                  <img src={`data:image/png;base64,${pixQrBase64}`} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                ) : (
                  <QrCode className="w-32 h-32 mx-auto text-gray-600" />
                )}
              </div>
              {pixCode && (
                <div className="text-xs bg-gray-100 p-2 rounded mb-3 break-all">{pixCode}</div>
              )}
              <div className="space-y-2">
                <Button className="w-full" onClick={() => navigator.clipboard.writeText(pixCode || '')}>
                  <Copy className="w-4 h-4 mr-2" /> Copiar Código PIX
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowPixModal(false)}>
                  Cancelar
                </Button>
              </div>
              {paymentId && (
                <div className="text-[10px] text-gray-400 mt-2">Pagamento #{paymentId}</div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Payment;