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
  const [showCardForm, setShowCardForm] = useState(false);
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

  const startPixPolling = async (id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('mercadopago-status', { body: { id } });
        if (error) throw error;
        const status = data?.payment?.status;
        if (status === 'approved' || status === 'authorized') {
          if (pollingRef.current) clearInterval(pollingRef.current);

          // Quando aprovado no MP, efetivar no banco
          const result = await processGroupPayment(
            group!.id,
            monthlyFee,
            'pix'
          );

          if (result.success) {
            toast({ title: 'Sucesso!', description: 'Pagamento aprovado via PIX.' });
            setShowPixModal(false);
            setTimeout(() => {
              navigate(`/payment/success/${id}`);
            }, 800);
          } else {
            toast({ title: 'Erro', description: result.error || 'Falha ao registrar pagamento', variant: 'destructive' });
          }
        }
      } catch (e) {
        console.error('Erro no polling do PIX:', e);
      }
    }, 3000);
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

    const [expMonth, expYearShort] = (expiry || '').split('/').map(s => s.trim());
    if (!expMonth || !expYearShort) throw new Error('Validade inválida (use MM/AA)');
    const expYear = `20${expYearShort}`;

    return new Promise<string>((resolve, reject) => {
      window.Mercadopago.createToken({
        cardNumber: cardNumber.replace(/\s+/g, ''),
        cardholderName: cardName,
        securityCode: cvv,
        identificationType: 'CPF',
        identificationNumber: (docNumber || '').replace(/\D/g, ''),
        expirationMonth: expMonth,
        expirationYear: expYear,
      }, (status: number, response: any) => {
        if (status === 200 || status === 201) {
          resolve(response.id);
        } else {
          reject(new Error(response?.message || 'Falha ao tokenizar cartão'));
        }
      });
    });
  }

  const handlePayment = async () => {
    if (!group || !user) return;
    setProcessing(true);

    try {
      if (paymentMethod === 'pix') {
        // Criar cobrança PIX no valor da primeira mensalidade
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
            externalReference: `GROUP_${group.id}_${Date.now()}`,
          },
        });
        if (error || data?.error || !data?.success) {
          console.error('PIX create error:', error || data);
          const detail = data?.mpError?.message || data?.mpError?.error || data?.error || error?.message || 'Erro desconhecido';
          toast({ title: 'Erro ao criar PIX', description: String(detail), variant: 'destructive' });
          throw new Error('Falha ao criar PIX');
        }

        const qr = data.payment?.point_of_interaction?.transaction_data;
        setPaymentId(data.payment?.id?.toString() || null);
        setPixQrBase64(qr?.qr_code_base64 || null);
        setPixCode(qr?.qr_code || null);
        setShowPixModal(true);

        if (data.payment?.id) startPixPolling(String(data.payment.id));
        setProcessing(false);
        return; // aguardará aprovação do PIX
      }

      if (paymentMethod === 'card') {
        setShowCardForm(true);
        setProcessing(false);
        return;
      }

      let paymentMethodParam: 'credits' | 'pix' | 'credit_card' | 'debit_card';
      switch (paymentMethod) {
        case 'balance':
          paymentMethodParam = 'credits';
          break;
        default:
          paymentMethodParam = 'credits';
      }

      const result = await processGroupPayment(
        group.id,
        monthlyFee,
        paymentMethodParam
      );

      if (result.success) {
        toast({ title: 'Sucesso!', description: 'Pagamento processado com sucesso!' });
        setTimeout(() => {
          navigate(`/payment/success/${id}`);
        }, 1000);
      } else {
        toast({ title: 'Erro', description: result.error || 'Erro ao processar pagamento', variant: 'destructive' });
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
      const token = await createCardToken();

      const payer = {
        email: user.email || 'user@example.com',
        first_name: user.user_metadata?.full_name || 'Usuario',
        last_name: 'JuntaPlay',
        identification: { type: 'CPF', number: (docNumber || '').replace(/\D/g, '') },
      };

      // Criar pagamento via Supabase Edge Function (independe de hospedagem)
      const { data, error } = await supabase.functions.invoke('mercadopago-create', {
        body: {
          type: 'card',
          amountCents: monthlyFee,
          description: `Assinatura do grupo ${group.name}`,
          payer,
          token,
          installments: 1,
          externalReference: `GROUP_${group.id}_${Date.now()}`,
        },
      });
      if (error || data?.error || !data?.success) throw new Error(error?.message || data?.error || 'Falha ao criar pagamento com cartão');

      const result = await processGroupPayment(group.id, monthlyFee, 'credit_card');
      if (result.success) {
        toast({ title: 'Sucesso!', description: 'Pagamento aprovado via Cartão.' });
        setShowCardForm(false);
        setTimeout(() => navigate(`/payment/success/${id}`), 800);
      } else {
        throw new Error(result.error || 'Falha ao registrar pagamento');
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
      
      <main className="max-w-4xl mx-auto px-4 py-6">
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
          </div>

          {/* Right Panel - Payment Methods */}
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

      {/* Credit Card Form Modal */}
      {showCardForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cartão de Crédito</h3>
              
              <div>
                <Label htmlFor="cardNumber">Número do Cartão</Label>
                <Input id="cardNumber" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Validade</Label>
                  <Input id="expiry" placeholder="MM/AA" value={expiry} onChange={e => setExpiry(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" value={cvv} onChange={e => setCvv(e.target.value)} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input id="cardName" placeholder="Nome como está no cartão" value={cardName} onChange={e => setCardName(e.target.value)} />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" value={docNumber} onChange={e => setDocNumber(e.target.value)} />
              </div>
              
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={handlePayCard} disabled={payingCard || !mpPublicKey}>
                  {payingCard ? 'Processando...' : `Pagar ${formatPrice(total * quantity + cardFee)}`}
                </Button>
                <Button variant="outline" onClick={() => setShowCardForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;