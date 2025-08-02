import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Eye, Wallet } from 'lucide-react';
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
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Meus Créditos</h1>
        </div>

        {/* Card de Saldo */}
        <Card className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">
              {formatCurrency(saldo)}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/creditos/adicionar')}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
              <Button
                onClick={() => navigate('/creditos/sacar')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600"
                disabled={saldo < 1000} // Mínimo R$ 10,00
              >
                <Minus className="h-4 w-4 mr-2" />
                Sacar
              </Button>
            </div>
            {saldo < 1000 && (
              <p className="text-purple-100 text-sm mt-2">
                Saldo mínimo para saque: R$ 10,00
              </p>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>
              Suas últimas movimentações financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transacoes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm">Suas movimentações aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/creditos/transacao/${transacao.id}`, { 
                      state: { transaction: transacao } 
                    })}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {getTransactionTypeLabel(transacao.type)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transacao.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transacao.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transacao.amount_cents > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transacao.amount_cents > 0 ? '+' : ''}{formatCurrency(transacao.amount_cents)}
                      </p>
                      {transacao.fee_cents > 0 && (
                        <p className="text-xs text-gray-500">
                          Taxa: {formatCurrency(transacao.fee_cents)}
                        </p>
                      )}
                      <p className={`text-xs ${getStatusColor(transacao.status)}`}>
                        {getStatusLabel(transacao.status)}
                      </p>
                    </div>
                    <Eye className="h-4 w-4 ml-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
  </>
);
};

export default Creditos;