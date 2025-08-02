import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, DollarSign, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, requestWithdrawal } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SacarCreditos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saldo, setSaldo] = useState(0);
  const [valor, setValor] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  const valorMinimo = 1000; // R$ 10,00 em centavos
  const valorMaximo = 100000; // R$ 1.000,00 em centavos

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const profile = await getUserProfile();
      if (profile) {
        setSaldo(profile.balance_cents || 0);
        if (profile.pix_key) {
          setPixKey(profile.pix_key);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingProfile(false);
    }
  };

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

  const validatePixKey = (key: string) => {
    // Validação básica para CPF, CNPJ, email, telefone
    const cpfRegex = /^\d{11}$/;
    const cnpjRegex = /^\d{14}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,11}$/;

    return cpfRegex.test(key) || cnpjRegex.test(key) || emailRegex.test(key) || phoneRegex.test(key);
  };

  const handleSolicitarSaque = async () => {
    const valorCentavos = parseInt(valor);

    if (!valorCentavos) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido para saque",
        variant: "destructive",
      });
      return;
    }

    if (valorCentavos < valorMinimo) {
      toast({
        title: "Valor muito baixo",
        description: `O valor mínimo para saque é ${formatCurrency(valorMinimo)}`,
        variant: "destructive",
      });
      return;
    }

    if (valorCentavos > valorMaximo) {
      toast({
        title: "Valor muito alto",
        description: `O valor máximo para saque é ${formatCurrency(valorMaximo)}`,
        variant: "destructive",
      });
      return;
    }

    if (valorCentavos > saldo) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem saldo suficiente para este saque",
        variant: "destructive",
      });
      return;
    }

    if (!pixKey) {
      toast({
        title: "Chave PIX obrigatória",
        description: "Digite sua chave PIX para receber o valor",
        variant: "destructive",
      });
      return;
    }

    if (!validatePixKey(pixKey.replace(/[^\w@.-]/g, ''))) {
      toast({
        title: "Chave PIX inválida",
        description: "Digite uma chave PIX válida (CPF, CNPJ, email ou telefone)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const result = await requestWithdrawal(valorCentavos, pixKey);

      if (result.success) {
        setWithdrawalSuccess(true);
        toast({
          title: "Saque solicitado!",
          description: "Sua solicitação foi enviada e será processada em até 2 dias úteis",
        });
        
        // Atualizar saldo local
        setSaldo(saldo - valorCentavos);
        
        // Redirecionar após 5 segundos
        setTimeout(() => {
          navigate('/creditos');
        }, 5000);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/creditos')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Carregando...</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (withdrawalSuccess) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/creditos')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Saque Solicitado</h1>
            </div>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Saque Solicitado!
              </h2>
              <p className="text-gray-600 mb-4">
                Sua solicitação de saque de {formatCurrency(parseInt(valor))} foi enviada
              </p>
              <p className="text-sm text-gray-500 mb-2">
                <strong>Chave PIX:</strong> {pixKey}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                O valor será transferido em até 2 dias úteis
              </p>
              <Button onClick={() => navigate('/creditos')}>
                Voltar aos Créditos
              </Button>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/creditos')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Sacar Créditos</h1>
        </div>

        {/* Card de Saldo Disponível */}
        <Card className="mb-6 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(saldo)}
            </div>
            <p className="text-green-100 text-sm mt-2">
              Valor mínimo para saque: {formatCurrency(valorMinimo)}
            </p>
          </CardContent>
        </Card>

        {saldo < valorMinimo ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Saldo Insuficiente</h3>
                <p className="text-gray-600 mb-4">
                  Você precisa de pelo menos {formatCurrency(valorMinimo)} para solicitar um saque
                </p>
                <Button onClick={() => navigate('/creditos/adicionar')}>
                  Adicionar Créditos
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Solicitar Saque</CardTitle>
              <CardDescription>
                Retire seus créditos via PIX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Valor do Saque */}
              <div>
                <Label htmlFor="valor">Valor do saque</Label>
                <Input
                  id="valor"
                  placeholder="Ex: 50,00"
                  value={valor ? formatCurrency(parseInt(valor)) : ''}
                  onChange={handleValorChange}
                  className="mt-1"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Mínimo: {formatCurrency(valorMinimo)}</span>
                  <span>Máximo: {formatCurrency(Math.min(valorMaximo, saldo))}</span>
                </div>
              </div>

              {/* Chave PIX */}
              <div>
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  placeholder="CPF, CNPJ, email ou telefone"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Digite sua chave PIX para receber o valor
                </p>
              </div>

              {/* Resumo */}
              {valor && parseInt(valor) >= valorMinimo && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Valor solicitado:</span>
                        <span className="font-medium">{formatCurrency(parseInt(valor))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de saque:</span>
                        <span className="font-medium text-green-600">Gratuito</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-bold">
                          <span>Você receberá:</span>
                          <span className="text-green-600">{formatCurrency(parseInt(valor))}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Informações importantes:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• O processamento leva até 2 dias úteis</li>
                  <li>• Saques são gratuitos</li>
                  <li>• Você receberá um email de confirmação</li>
                  <li>• Em caso de problemas, entre em contato conosco</li>
                </ul>
              </div>

              <Button
                onClick={handleSolicitarSaque}
                disabled={!valor || parseInt(valor) < valorMinimo || parseInt(valor) > saldo || !pixKey || loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  `Solicitar Saque de ${valor ? formatCurrency(parseInt(valor)) : 'R$ 0,00'}`
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    <Footer />
  </>
);
};

export default SacarCreditos;