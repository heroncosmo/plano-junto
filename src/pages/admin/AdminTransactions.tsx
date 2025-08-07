import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllTransactions } from '@/integrations/supabase/functions';

interface TransactionData {
  id: string;
  user_id: string;
  type: string;
  amount_cents: number;
  description: string;
  group_id?: string;
  payment_method?: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    user_id: string;
  };
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const transactionsData = await getAllTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico de transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'balance_adjustment':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'payment':
        return 'Pagamento';
      case 'withdrawal':
        return 'Saque';
      case 'balance_adjustment':
        return 'Ajuste de Saldo';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p>Carregando transações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Histórico de Transações</h2>
        <p className="text-gray-600">
          Visualize todas as transações do sistema
        </p>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma transação encontrada</h3>
            <p className="text-gray-600">
              Não há transações registradas no sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getTransactionTypeIcon(transaction.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getTransactionTypeLabel(transaction.type)}
                      </h3>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {transaction.profiles?.full_name || 'Cliente não identificado'} • {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Valor</p>
                      <p className={`font-semibold text-lg ${
                        transaction.type === 'withdrawal' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'withdrawal' ? '+' : ''}{formatCurrency(transaction.amount_cents)}
                      </p>
                    </div>
                    
                    <Badge variant="outline" className={getStatusColor(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTransactions; 