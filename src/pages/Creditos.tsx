import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Eye, Wallet, TrendingUp, Clock, CreditCard, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, getUserTransactions } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Transaction {
  id: string;
  type: string;
  amount_cents: number;
  fee_cents: number;
  description: string;
  status: string;
  payment_method: string;
  created_at: string;
}

const Creditos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saldo, setSaldo] = useState(0);
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Buscar perfil do usuário para obter saldo
      const profile = await getUserProfile();
      if (profile) {
        setSaldo(profile.balance_cents || 0);
      }

      // Buscar transações
      const transactions = await getUserTransactions(20);
      setTransacoes(transactions);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'credit_purchase': 'Adição de Créditos',
      'group_payment': 'Pagamento de Grupo',
      'withdrawal': 'Saque',
      'admin_fee': 'Taxa Administrativa',
      'balance_adjustment': 'Ajuste de Saldo'
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-cyan-600 bg-cyan-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'completed': 'Concluído',
      'pending': 'Pendente',
      'failed': 'Falhou'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-3 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Carregando...</h1>
            </div>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mr-3 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Meus Créditos</h1>
          </div>

          {/* Balance Card */}
          <Card className="mb-8 border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Saldo Disponível</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(saldo)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/creditos/adicionar')}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Créditos
                </Button>
                <Button
                  onClick={() => navigate('/creditos/sacar')}
                  variant="outline"
                  className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50"
                  disabled={saldo < 1000}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Sacar
                </Button>
              </div>
              
              {saldo < 1000 && (
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Saldo mínimo para saque: R$ 10,00
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/faturas')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Minhas Faturas</h3>
                    <p className="text-sm text-gray-600">Pagamentos e tentativas de entrada em grupos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/grupos')}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Explorar Grupos</h3>
                    <p className="text-sm text-gray-600">Encontre novos grupos para participar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Histórico de Transações</h2>
                <p className="text-sm text-gray-600 mt-1">Suas últimas movimentações de saldo</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {transacoes.length} transações
              </div>
            </div>

            {transacoes.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação</h3>
                  <p className="text-gray-500">Suas movimentações aparecerão aqui quando você fizer transações.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {transacoes.map((transacao) => (
                  <Card 
                    key={transacao.id}
                    className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/creditos/transacao/${transacao.id}`, { 
                      state: { transaction: transacao } 
                    })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {getTransactionTypeLabel(transacao.type)}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transacao.status)}`}>
                              {getStatusLabel(transacao.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {transacao.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transacao.created_at)}
                          </p>
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className={`text-lg font-semibold ${
                            transacao.amount_cents > 0 ? 'text-cyan-600' : 'text-red-600'
                          }`}>
                            {transacao.amount_cents > 0 ? '+' : ''}{formatCurrency(transacao.amount_cents)}
                          </p>
                          {transacao.fee_cents > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Taxa: {formatCurrency(transacao.fee_cents)}
                            </p>
                          )}
                        </div>
                        
                        <Eye className="h-4 w-4 ml-3 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Creditos;