import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Building2,
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Payment = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { group, service, relationshipType } = location.state || {};
  const [profile, setProfile] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('credits');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!group || !service) {
      navigate('/');
      return;
    }

    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const totalAmount = group.price_per_slot_cents + 450; // Adding service fee

      if (selectedMethod === 'credits') {
        // Check if user has enough credits
        if ((profile?.balance_cents || 0) < totalAmount) {
          toast({
            title: "Saldo insuficiente",
            description: "Você não tem créditos suficientes. Adicione créditos ou escolha outro método.",
            variant: "destructive"
          });
          setProcessing(false);
          return;
        }

        // Process with credits
        await processWithCredits(totalAmount);
      } else {
        // For now, just show success for other payment methods
        await processWithOtherMethods(totalAmount);
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Erro no pagamento",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const processWithCredits = async (amount: number) => {
    try {
      // Create group membership
      const { error: membershipError } = await supabase
        .from('group_memberships')
        .insert({
          group_id: id,
          user_id: user?.id,
          paid_amount_cents: amount
        });

      if (membershipError) throw membershipError;

      // Update user balance
      const newBalance = (profile?.balance_cents || 0) - amount;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance_cents: newBalance })
        .eq('user_id', user?.id);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          group_id: id,
          type: 'group_payment',
          amount_cents: group.price_per_slot_cents,
          fee_cents: 450,
          status: 'completed',
          payment_method: 'credits',
          description: `Pagamento para grupo ${group.name}`
        });

      if (transactionError) throw transactionError;

      // Update group current members
      const { error: groupError } = await supabase
        .from('groups')
        .update({ current_members: group.current_members + 1 })
        .eq('id', id);

      if (groupError) throw groupError;

      toast({
        title: "Pagamento realizado com sucesso!",
        description: "Você agora faz parte do grupo. Os dados de acesso serão enviados em breve.",
      });

      navigate('/dashboard');

    } catch (error) {
      throw error;
    }
  };

  const processWithOtherMethods = async (amount: number) => {
    // For demo purposes, simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Pagamento em processamento",
      description: "Seu pagamento está sendo processado. Você receberá uma confirmação em breve.",
    });

    navigate('/dashboard');
  };

  if (!group || !service) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sessão expirada</h1>
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const totalAmount = group.price_per_slot_cents + 450;
  const hasEnoughCredits = (profile?.balance_cents || 0) >= totalAmount;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/group/${id}/join`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Pagamento</h1>
            <p className="text-muted-foreground">
              Finalize o pagamento para participar do grupo
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Escolha a forma de pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="credits" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Créditos
                      </TabsTrigger>
                      <TabsTrigger value="card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Cartão
                      </TabsTrigger>
                      <TabsTrigger value="pix" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        PIX
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="credits" className="mt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Saldo disponível</p>
                            <p className="text-sm text-muted-foreground">
                              Use seus créditos para pagamento instantâneo
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              R$ {((profile?.balance_cents || 0) / 100).toFixed(2)}
                            </p>
                            <Badge variant={hasEnoughCredits ? "default" : "destructive"}>
                              {hasEnoughCredits ? "Suficiente" : "Insuficiente"}
                            </Badge>
                          </div>
                        </div>

                        {!hasEnoughCredits && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-orange-500" />
                              <p className="font-medium text-orange-700">Saldo insuficiente</p>
                            </div>
                            <p className="text-sm text-orange-600 mt-1">
                              Você precisa de R$ {((totalAmount - (profile?.balance_cents || 0)) / 100).toFixed(2)} 
                              adicionais para completar o pagamento.
                            </p>
                            <Button variant="outline" className="mt-3" size="sm">
                              Adicionar Créditos
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="card" className="mt-6">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">Cartão de Crédito/Débito</p>
                              <p className="text-sm text-muted-foreground">
                                Pagamento processado via Mercado Pago
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-700">
                            💳 Taxa do cartão: R$ 2,37
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pix" className="mt-6">
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">PIX</p>
                              <p className="text-sm text-muted-foreground">
                                Pagamento instantâneo via PIX
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <p className="font-medium text-green-700">PIX Programado no JuntaPlay</p>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            Rápido e fácil! Configure uma vez e pague automaticamente.
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo da Inscrição #{Math.random().toString(36).substr(2, 6).toUpperCase()}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{group.name}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Mensalidade</span>
                        <span>R$ {(group.price_per_slot_cents / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cupom</span>
                        <span>R$ {(group.price_per_slot_cents / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span className="text-sm">Desconto</span>
                        <span>-R$ {(group.price_per_slot_cents / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Taxa de serviço</span>
                        <span>R$ 4,50</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>R$ {(totalAmount / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    {selectedMethod === 'credits' && hasEnoughCredits && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <p className="text-sm font-medium text-green-700">
                            Saldo disponível: R$ {((profile?.balance_cents || 0) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>✓ Acesso garantido após confirmação</p>
                      <p>✓ Dados enviados em até 3 dias úteis</p>
                      <p>✓ Suporte via WhatsApp</p>
                    </div>
                  </div>

                  <Button 
                    className="w-full shadow-button"
                    onClick={handlePayment}
                    disabled={processing || (selectedMethod === 'credits' && !hasEnoughCredits)}
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processando...
                      </div>
                    ) : (
                      `Finalizar Pagamento R$ ${(totalAmount / 100).toFixed(2)}`
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Tem um cupom? <Button variant="link" className="p-0 h-auto text-xs">Clique aqui</Button>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;