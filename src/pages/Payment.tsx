import { useState } from 'react';
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

type PaymentMethod = 'balance' | 'pix' | 'card';

const Payment = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('balance');
  const [showMoreMethods, setShowMoreMethods] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showPixQr, setShowPixQr] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  const relationship = searchParams.get('relationship') || 'familia';
  const { group, loading, error } = useGroupById(id || '');

  // Simulated user balance - more realistic value
  const userBalance = 13500; // R$ 135,00 in cents (enough to pay for the service)
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

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (paymentMethod === 'pix') {
      setShowPixQr(true);
    } else if (paymentMethod === 'card') {
      setShowCardForm(true);
    } else {
      // Balance payment - simulate success
      navigate(`/payment/success/${id}`);
    }
    
    setProcessing(false);
  };

  const handleBack = () => {
    navigate(`/join-group/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
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
                        <p className="text-sm text-gray-600">{group.service?.name}</p>
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
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">Cartão de Crédito</span>
                          <span className="text-red-600 text-xs">+ {formatPrice(cardFee)}</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Show More Methods Button */}
                  <Button
                    variant="ghost"
                    onClick={() => setShowMoreMethods(!showMoreMethods)}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto text-xs"
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
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

      {/* PIX QR Code Modal */}
      {showPixQr && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Pagamento PIX</h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <QrCode className="w-32 h-32 mx-auto text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR Code com seu app bancário
              </p>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => setShowPixQr(false)}>
                  Copiar Código PIX
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowPixQr(false)}>
                  Cancelar
                </Button>
              </div>
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
                <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Validade</Label>
                  <Input id="expiry" placeholder="MM/AA" />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cardName">Nome no Cartão</Label>
                <Input id="cardName" placeholder="Nome como está no cartão" />
              </div>
              
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={() => setShowCardForm(false)}>
                  Pagar {formatPrice(total * quantity + cardFee)}
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