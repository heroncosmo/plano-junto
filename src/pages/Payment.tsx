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
  Wallet,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle
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
  const [cardBrand, setCardBrand] = useState<string>('');
  const [cardErrors, setCardErrors] = useState<{[key: string]: string}>({});

  const relationship = searchParams.get('relationship') || 'familia';
  const { group, loading, error } = useGroupById(id || '');

  // Função para detectar bandeira do cartão
  const detectCardBrand = (number: string): string => {
    const cleanNumber = number.replace(/\D/g, '');

    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
    if (/^35(2[89]|[3-8][0-9])/.test(cleanNumber)) return 'jcb';
    if (/^30[0-5]/.test(cleanNumber) || /^36/.test(cleanNumber) || /^38/.test(cleanNumber)) return 'diners';
    if (/^60/.test(cleanNumber)) return 'hipercard';
    if (/^606282/.test(cleanNumber)) return 'hipercard';
    if (/^637/.test(cleanNumber)) return 'elo';
    if (/^50/.test(cleanNumber)) return 'elo';

    return '';
  };

  // Função para obter ícone da bandeira
  const getCardBrandIcon = (brand: string) => {
    const iconComponents: {[key: string]: JSX.Element} = {
      visa: (
        <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
          VISA
        </div>
      ),
      mastercard: (
        <div className="w-8 h-5 bg-red-500 rounded text-white text-xs font-bold flex items-center justify-center">
          MC
        </div>
      ),
      amex: (
        <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs font-bold flex items-center justify-center">
          AMEX
        </div>
      ),
      elo: (
        <div className="w-8 h-5 bg-yellow-500 rounded text-white text-xs font-bold flex items-center justify-center">
          ELO
        </div>
      ),
      hipercard: (
        <div className="w-8 h-5 bg-red-600 rounded text-white text-xs font-bold flex items-center justify-center">
          HIPER
        </div>
      ),
      diners: (
        <div className="w-8 h-5 bg-gray-600 rounded text-white text-xs font-bold flex items-center justify-center">
          DINERS
        </div>
      )
    };
    return iconComponents[brand] || (
      <div className="w-8 h-5 bg-gray-400 rounded text-white text-xs font-bold flex items-center justify-center">
        <CreditCard className="h-3 w-3" />
      </div>
    );
  };

  // Função para validar campo em tempo real
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'cardNumber':
        const cleanNum = value.replace(/\D/g, '');
        if (cleanNum.length < 13) return 'Número muito curto';
        if (cleanNum.length > 19) return 'Número muito longo';
        return '';

      case 'cardName':
        if (value.length < 2) return 'Nome muito curto';
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Apenas letras e espaços';
        return '';

      case 'expiry':
        const [month, year] = value.split('/');
        if (!month || !year) return 'Formato inválido';
        const monthNum = parseInt(month);
        if (monthNum < 1 || monthNum > 12) return 'Mês inválido';
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const yearNum = parseInt(year.length === 2 ? `20${year}` : year);
        if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
          return 'Cartão vencido';
        }
        return '';

      case 'cvv':
        if (value.length < 3) return 'CVV muito curto';
        if (cardBrand === 'amex' && value.length !== 4) return 'Amex requer 4 dígitos';
        if (cardBrand !== 'amex' && value.length !== 3) return 'Requer 3 dígitos';
        return '';

      case 'docNumber':
        const cleanCpf = value.replace(/\D/g, '');
        if (cleanCpf.length !== 11) return 'CPF deve ter 11 dígitos';
        return '';

      default:
        return '';
    }
  };

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

    const [expMonth, expYearInput] = (expiry || '').split('/').map(s => s.trim());
    if (!expMonth || !expYearInput) {
      throw new Error('Validade inválida (use MM/AA)');
    }

    // Validar mês
    if (expMonth.length !== 2 || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
      throw new Error('Mês inválido (use 01-12)');
    }

    // Validar ano - aceitar tanto AA quanto AAAA
    let expYear: string;
    if (expYearInput.length === 2) {
      // Formato AA - assumir 20XX
      expYear = `20${expYearInput}`;
    } else if (expYearInput.length === 4) {
      // Formato AAAA - usar diretamente
      expYear = expYearInput;
    } else {
      throw new Error('Ano inválido (use AA ou AAAA)');
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const yearNum = parseInt(expYear);
    const monthNum = parseInt(expMonth);

    // Validar se o ano é razoável (entre ano atual e +20 anos)
    if (yearNum < currentYear || yearNum > currentYear + 20) {
      throw new Error('Ano de validade inválido');
    }

    // Verificar se não está vencido
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      throw new Error('Cartão vencido');
    }

    // Preparar dados para o MercadoPago
    const tokenData = {
      cardNumber: cardNumber.replace(/\s+/g, ''),
      cardholderName: cardName.trim(),
      securityCode: cvv,
      identificationType: 'CPF',
      identificationNumber: docNumber.replace(/\D/g, ''),
      expirationMonth: expMonth,
      expirationYear: expYear,
    };

    console.log('Criando token com dados:', {
      cardNumber: tokenData.cardNumber.substring(0, 6) + '...',
      cardholderName: tokenData.cardholderName,
      expirationMonth: tokenData.expirationMonth,
      expirationYear: tokenData.expirationYear,
      identificationType: tokenData.identificationType,
      identificationNumber: tokenData.identificationNumber.substring(0, 3) + '...',
      securityCode: '***'
    });

    // Validações finais antes de enviar
    if (tokenData.cardNumber.length < 13 || tokenData.cardNumber.length > 19) {
      throw new Error('Número do cartão deve ter entre 13 e 19 dígitos');
    }
    if (tokenData.identificationNumber.length !== 11) {
      throw new Error('CPF deve ter 11 dígitos');
    }
    if (tokenData.securityCode.length < 3 || tokenData.securityCode.length > 4) {
      throw new Error('CVV deve ter 3 ou 4 dígitos');
    }

    return new Promise<string>((resolve, reject) => {
      window.Mercadopago.createToken(tokenData, (status: number, response: any) => {
        console.log('MercadoPago token response:', { status, response });
        if (status === 200 || status === 201) {
          resolve(response.id);
        } else {
          console.error('Erro ao criar token:', response);

          // Extrair mensagem de erro mais específica
          let errorMessage = 'Falha ao tokenizar cartão';

          if (response?.cause && Array.isArray(response.cause)) {
            const causes = response.cause.map((c: any) => c.description || c.message).filter(Boolean);
            if (causes.length > 0) {
              errorMessage = causes.join(', ');
            }
          } else if (response?.message) {
            errorMessage = response.message;
          }

          // Traduzir erros comuns
          if (errorMessage.includes('invalid parameters')) {
            errorMessage = 'Dados do cartão inválidos. Verifique número, validade, CVV e CPF.';
          } else if (errorMessage.includes('invalid card number')) {
            errorMessage = 'Número do cartão inválido';
          } else if (errorMessage.includes('invalid expiration')) {
            errorMessage = 'Data de validade inválida';
          } else if (errorMessage.includes('invalid security code')) {
            errorMessage = 'CVV inválido';
          }

          reject(new Error(errorMessage));
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Dados do Cartão</h2>
                      <p className="text-sm text-gray-500">Informações seguras e criptografadas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs font-medium">SSL</span>
                  </div>
                </div>

                <Card className="border border-gray-200 shadow-xl bg-gradient-to-br from-white via-gray-50 to-white backdrop-blur-sm">
                  <CardContent className="p-8 space-y-6">
                    {/* Progress Indicator */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Progresso do preenchimento</span>
                        <span>{Math.round(((cardNumber ? 1 : 0) + (cardName ? 1 : 0) + (expiry ? 1 : 0) + (cvv ? 1 : 0) + (docNumber ? 1 : 0)) / 5 * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${((cardNumber ? 1 : 0) + (cardName ? 1 : 0) + (expiry ? 1 : 0) + (cvv ? 1 : 0) + (docNumber ? 1 : 0)) / 5 * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Card Preview */}
                    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-500/20 rounded-full translate-y-12 -translate-x-12"></div>

                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded"></div>
                          {cardBrand && (
                            <div className="scale-125">
                              {getCardBrandIcon(cardBrand)}
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="font-mono text-lg tracking-wider">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <div className="text-xs text-gray-400 uppercase tracking-wide">Nome do Portador</div>
                              <div className="font-medium">
                                {cardName || 'SEU NOME AQUI'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 uppercase tracking-wide">Validade</div>
                              <div className="font-mono">
                                {expiry || 'MM/AA'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {/* Card Number */}
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                          Número do Cartão
                        </Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={e => {
                              // Remover tudo que não é número
                              const numbers = e.target.value.replace(/\D/g, '');
                              // Limitar a 19 dígitos
                              const limited = numbers.substring(0, 19);
                              // Formatar com espaços a cada 4 dígitos
                              const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
                              setCardNumber(formatted);

                              // Detectar bandeira
                              const brand = detectCardBrand(limited);
                              setCardBrand(brand);

                              // Validar em tempo real
                              const error = validateField('cardNumber', limited);
                              setCardErrors(prev => ({ ...prev, cardNumber: error }));
                            }}
                            maxLength={23} // 19 dígitos + 4 espaços
                            className={`pr-12 ${cardErrors.cardNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'} transition-colors`}
                          />
                          {/* Ícone da bandeira */}
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                            {cardBrand && (
                              <div className="flex items-center space-x-1">
                                {getCardBrandIcon(cardBrand)}
                              </div>
                            )}
                            {!cardErrors.cardNumber && cardNumber.length > 0 && !cardBrand && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        {cardErrors.cardNumber && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs">{cardErrors.cardNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Name */}
                      <div className="space-y-2">
                        <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">
                          Nome no Cartão
                        </Label>
                        <div className="relative">
                          <Input
                            id="cardName"
                            placeholder="Nome como está no cartão"
                            value={cardName}
                            onChange={e => {
                              const value = e.target.value.toUpperCase();
                              setCardName(value);

                              // Validar em tempo real
                              const error = validateField('cardName', value);
                              setCardErrors(prev => ({ ...prev, cardName: error }));
                            }}
                            className={`${cardErrors.cardName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'} transition-colors`}
                          />
                          {!cardErrors.cardName && cardName.length > 0 && (
                            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {cardErrors.cardName && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs">{cardErrors.cardName}</span>
                          </div>
                        )}
                      </div>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry" className="text-sm font-medium text-gray-700">
                            Validade
                          </Label>
                          <div className="relative">
                            <Input
                              id="expiry"
                              placeholder="MM/AA"
                              value={expiry}
                              onChange={e => {
                                // Remover tudo que não é número
                                const numbers = e.target.value.replace(/\D/g, '');
                                // Limitar a 4 dígitos
                                const limited = numbers.substring(0, 4);
                                // Formatar MM/AA
                                let formatted = limited;
                                if (limited.length >= 2) {
                                  formatted = limited.substring(0, 2) + '/' + limited.substring(2);
                                }
                                setExpiry(formatted);

                                // Validar em tempo real
                                const error = validateField('expiry', formatted);
                                setCardErrors(prev => ({ ...prev, expiry: error }));
                              }}
                              maxLength={5} // MM/AA
                              className={`${cardErrors.expiry ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'} transition-colors`}
                            />
                            {!cardErrors.expiry && expiry.length === 5 && (
                              <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                            )}
                          </div>
                          {cardErrors.expiry && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span className="text-xs">{cardErrors.expiry}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-1">
                            <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">
                              CVV
                            </Label>
                            <div className="group relative">
                              <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                3 dígitos no verso (4 para Amex)
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <Input
                              id="cvv"
                              placeholder={cardBrand === 'amex' ? '0000' : '000'}
                              value={cvv}
                              onChange={e => {
                                // Apenas números, máximo 4 dígitos
                                const numbers = e.target.value.replace(/\D/g, '').substring(0, 4);
                                setCvv(numbers);

                                // Validar em tempo real
                                const error = validateField('cvv', numbers);
                                setCardErrors(prev => ({ ...prev, cvv: error }));
                              }}
                              maxLength={4}
                              type="password"
                              className={`${cardErrors.cvv ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'} transition-colors`}
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                          {cardErrors.cvv && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              <span className="text-xs">{cardErrors.cvv}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CPF */}
                      <div className="space-y-2">
                        <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                          CPF do Portador
                        </Label>
                        <div className="relative">
                          <Input
                            id="cpf"
                            placeholder="000.000.000-00"
                            value={docNumber}
                            onChange={e => {
                              // Remover tudo que não é número
                              const numbers = e.target.value.replace(/\D/g, '');
                              // Limitar a 11 dígitos
                              const limited = numbers.substring(0, 11);
                              // Formatar CPF: 000.000.000-00
                              let formatted = limited;
                              if (limited.length > 3) {
                                formatted = limited.substring(0, 3) + '.' + limited.substring(3);
                              }
                              if (limited.length > 6) {
                                formatted = limited.substring(0, 3) + '.' + limited.substring(3, 6) + '.' + limited.substring(6);
                              }
                              if (limited.length > 9) {
                                formatted = limited.substring(0, 3) + '.' + limited.substring(3, 6) + '.' + limited.substring(6, 9) + '-' + limited.substring(9);
                              }
                              setDocNumber(formatted);

                              // Validar em tempo real
                              const error = validateField('docNumber', formatted);
                              setCardErrors(prev => ({ ...prev, docNumber: error }));
                            }}
                            maxLength={14} // 000.000.000-00
                            className={`${cardErrors.docNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-cyan-500'} transition-colors`}
                          />
                          {!cardErrors.docNumber && docNumber.length === 14 && (
                            <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {cardErrors.docNumber && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs">{cardErrors.docNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Coupon */}
                      <div>
                        <Input
                          placeholder="Tem um cupom?"
                          className="text-center border-gray-300 text-sm"
                        />
                      </div>

                      {/* Payment Summary for Card */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                            <span>Resumo do Pagamento</span>
                            <Shield className="h-4 w-4 text-green-500" />
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">{formatPrice(total * quantity)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Taxa do cartão:</span>
                              <span className="text-amber-600">+ {formatPrice(cardFee)}</span>
                            </div>
                            <div className="border-t border-gray-300 pt-2">
                              <div className="flex justify-between font-semibold text-lg">
                                <span className="text-gray-900">Total:</span>
                                <span className="text-cyan-600">{formatPrice(total * quantity + cardFee)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Security Notice */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-green-800">
                          <Lock className="h-4 w-4" />
                          <span className="text-xs font-medium">
                            Seus dados estão protegidos com criptografia SSL de 256 bits
                          </span>
                        </div>
                      </div>

                      {/* Payment Button */}
                      <div className="pt-2">
                        <Button
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                          onClick={handlePayCard}
                          disabled={payingCard || !mpPublicKey || Object.values(cardErrors).some(error => error !== '')}
                        >
                          {payingCard ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              <span>Processando pagamento...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <Lock className="h-5 w-5" />
                              <span>Finalizar Pagamento Seguro</span>
                              <span className="text-lg">→</span>
                            </div>
                          )}
                        </Button>

                        {!mpPublicKey && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                            <div className="flex items-center space-x-2 text-red-800">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-xs">
                                Cartão indisponível: configure a chave pública no painel administrativo
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Trust indicators */}
                        <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>SSL</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Lock className="h-3 w-3" />
                            <span>Criptografado</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Seguro</span>
                          </div>
                        </div>
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