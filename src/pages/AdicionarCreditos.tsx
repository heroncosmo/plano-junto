import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Smartphone, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addUserCredits } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createPixPayment, getPayment, type MPayer } from '@/integrations/mercadopago';

const AdicionarCreditos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [valor, setValor] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('pix');
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // PIX state
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixQrBase64, setPixQrBase64] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const valorPredefinido = [1000, 2000, 5000, 10000, 20000, 50000]; // Em centavos

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d]/g, '');
    setValor(inputValue);
  };

  const handleValorPredefinido = (valorCentavos: number) => {
    setValor(valorCentavos.toString());
  };

  const calcularTaxa = (valorCentavos: number) => {
    return Math.max(Math.floor(valorCentavos * 0.05), 100); // 5% ou mínimo R$ 1,00
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPixPolling = (id: string, valorCentavosLiquido: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const resp = await getPayment(id);
        const status = resp?.payment?.status;
        if (status === 'approved' || status === 'authorized') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          await processarCreditos(valorCentavosLiquido, id);
          setShowPixModal(false);
        }
      } catch (e) {
        console.error('Erro no polling do PIX:', e);
      }
    }, 3000);
  };

  const handleProcessarPagamento = async () => {
    const valorCentavos = parseInt(valor);
    
    if (!valorCentavos || valorCentavos < 500) { // Mínimo R$ 5,00
      toast({
        title: 'Valor inválido',
        description: 'O valor mínimo para adicionar créditos é R$ 5,00',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Simular processamento de pagamento externo
      let externalPaymentId: string | undefined;

      if (metodoPagamento === 'pix') {
        // Criar pagamento PIX via Mercado Pago
        const taxa = calcularTaxa(valorCentavos);
        const totalCentavos = valorCentavos + taxa;

        const payer: MPayer = {
          email: 'user@example.com',
          first_name: 'Usuario',
          last_name: 'JuntaPlay',
        };

        const pixResp = await createPixPayment({
          amountCents: totalCentavos,
          description: `Adicionar créditos ${formatCurrency(valorCentavos)}`,
          payer,
          externalReference: `CREDITO_${Date.now()}`,
        });

        if (!pixResp.success || !pixResp.payment) {
          throw new Error(pixResp.error || 'Falha ao criar PIX');
        }

        const qr = pixResp.payment?.point_of_interaction?.transaction_data;
        setPaymentId(pixResp.payment?.id?.toString() || null);
        setPixQrBase64(qr?.qr_code_base64 || null);
        setPixCode(qr?.qr_code || null);
        setShowPixModal(true);

        if (pixResp.payment?.id) {
          startPixPolling(String(pixResp.payment.id), valorCentavos);
        }
        setLoading(false);
        return; // aguardar pagamento PIX
      } else {
        // Cartão (placeholder): manter simulação por enquanto
        externalPaymentId = `CARD_${Date.now()}`;
        await new Promise(resolve => setTimeout(resolve, 2000));
        await processarCreditos(valorCentavos, externalPaymentId);
      }

    } catch (error) {
      console.error('Erro no pagamento:', error);
      toast({
        title: 'Erro no pagamento',
        description: 'Não foi possível processar o pagamento. Tente novamente.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const processarCreditos = async (valorCentavos: number, externalPaymentId: string) => {
    try {
      const result = await addUserCredits(
        valorCentavos,
        metodoPagamento as 'pix' | 'credit_card' | 'debit_card',
        externalPaymentId
      );

      if (result.success) {
        setPaymentSuccess(true);
        toast({
          title: 'Créditos adicionados!',
          description: `${formatCurrency(valorCentavos)} foram adicionados à sua conta`,
        });
        setTimeout(() => {
          navigate('/creditos');
        }, 3000);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao adicionar créditos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar os créditos. Entre em contato com o suporte.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {paymentSuccess ? (
            <div className="text-center">
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/creditos')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Pagamento Realizado</h1>
              </div>

              <Card className="text-center p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Créditos Adicionados!
                </h2>
                <p className="text-gray-600 mb-4">
                  {formatCurrency(parseInt(valor))} foram adicionados à sua conta
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Redirecionando em alguns segundos...
                </p>
                <Button onClick={() => navigate('/creditos')}>
                  Ver Meus Créditos
                </Button>
              </Card>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/creditos')}
                  className="mr-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Adicionar Créditos</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Escolha o valor</CardTitle>
                  <CardDescription>
                    Adicione créditos à sua conta para participar de grupos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Valores Predefinidos */}
                  <div>
                    <Label className="text-base font-medium">Valores sugeridos</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      {valorPredefinido.map((valor) => (
                        <Button
                          key={valor}
                          variant="outline"
                          onClick={() => handleValorPredefinido(valor)}
                          className="text-center"
                        >
                          {formatCurrency(valor)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Valor Personalizado */}
                  <div>
                    <Label htmlFor="valor">Ou digite um valor personalizado</Label>
                    <Input
                      id="valor"
                      placeholder="Ex: 15,00"
                      value={valor ? formatCurrency(parseInt(valor)) : ''}
                      onChange={handleValorChange}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Valor mínimo: R$ 5,00
                    </p>
                  </div>

                  {/* Resumo */}
                  {valor && parseInt(valor) >= 500 && (
                    <Card className="bg-gray-50">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Valor a adicionar:</span>
                            <span className="font-medium">{formatCurrency(parseInt(valor))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taxa de processamento:</span>
                            <span className="font-medium">{formatCurrency(calcularTaxa(parseInt(valor)))}</span>
                          </div>
                          <div className="border-t pt-2">
                            <div className="flex justify-between font-bold">
                              <span>Total a pagar:</span>
                              <span>{formatCurrency(parseInt(valor) + calcularTaxa(parseInt(valor)))}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Método de Pagamento */}
                  <div>
                    <Label className="text-base font-medium">Método de pagamento</Label>
                    <RadioGroup
                      value={metodoPagamento}
                      onValueChange={setMetodoPagamento}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex items-center cursor-pointer flex-1">
                          <Smartphone className="h-5 w-5 mr-2 text-green-600" />
                          <div>
                            <div className="font-medium">PIX</div>
                            <div className="text-sm text-gray-500">
                              Aprovação instantânea
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="credit_card" id="credit_card" />
                        <Label htmlFor="credit_card" className="flex items-center cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5 mr-2 text-cyan-600" />
                          <div>
                            <div className="font-medium">Cartão de Crédito</div>
                            <div className="text-sm text-gray-500">
                              Aprovação em até 1 hora
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="debit_card" id="debit_card" />
                        <Label htmlFor="debit_card" className="flex items-center cursor-pointer flex-1">
                          <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                          <div>
                            <div className="font-medium">Cartão de Débito</div>
                            <div className="text-sm text-gray-500">
                              Aprovação instantânea
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={handleProcessarPagamento}
                    disabled={!valor || parseInt(valor) < 500 || loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      `Pagar ${valor ? formatCurrency(parseInt(valor) + calcularTaxa(parseInt(valor))) : ''}`
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Ao continuar, você concorda com nossos{' '}
                    <a href="/termos" className="text-purple-600 hover:underline">
                      Termos de Uso
                    </a>{' '}
                    e{' '}
                    <a href="/privacidade" className="text-purple-600 hover:underline">
                      Política de Privacidade
                    </a>
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      
      {/* PIX Modal */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-3">Pagamento PIX</h3>
            {pixQrBase64 ? (
              <img
                src={`data:image/png;base64,${pixQrBase64}`}
                alt="QR Code PIX"
                className="w-56 h-56 mx-auto mb-3"
              />
            ) : (
              <div className="w-56 h-56 bg-gray-100 animate-pulse mx-auto mb-3" />
            )}
            {pixCode && (
              <div className="bg-gray-100 rounded p-2 text-xs break-all mb-3">
                {pixCode}
              </div>
            )}
            <div className="text-sm text-gray-600 mb-4">
              Escaneie o QR Code no seu banco. Assim que o pagamento for aprovado, os créditos serão adicionados automaticamente.
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => navigator.clipboard.writeText(pixCode || '')}>
                Copiar código PIX
              </Button>
              <Button variant="outline" onClick={() => setShowPixModal(false)}>
                Fechar
              </Button>
            </div>
            {paymentId && (
              <div className="text-[10px] text-gray-400 mt-2">Pagamento #{paymentId}</div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default AdicionarCreditos;