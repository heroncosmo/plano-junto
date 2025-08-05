import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Calendar, DollarSign, User, Users, CheckCircle, Clock, XCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount_cents: number;
  fee_cents: number;
  description: string;
  created_at: string;
  status: string;
  payment_method: string;
  groupName?: string;
  participantName?: string;
  groupId?: string;
  participantId?: string;
}

const DetalhesTransacao = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { transaction } = location.state || {};

  const formatPrice = (priceCents: number) => {
    if (!priceCents || isNaN(priceCents)) return 'R$ 0,00';
    return `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <div className="text-center">
            <p className="text-gray-600">Transação não encontrada</p>
            <Button onClick={() => navigate('/creditos')} className="mt-4">
              Voltar aos Créditos
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/creditos')}
          className="mb-6 p-0 h-auto text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar aos Créditos
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Detalhes da Transação</h1>
          <p className="text-gray-600">Informações completas sobre esta transação</p>
        </div>

        {/* Transaction Details */}
        <div className="space-y-6">
          {/* Main Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informações da Transação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ID da Transação:</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {transaction.id}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Descrição:</span>
                <span className="font-medium text-right max-w-xs">
                  {transaction.description}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className={`font-bold text-lg ${
                  transaction.amount_cents > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount_cents > 0 ? '+' : '-'} {formatPrice(Math.abs(transaction.amount_cents))}
                </span>
              </div>

              {transaction.fee_cents > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxa:</span>
                  <span className="font-medium text-red-600">
                    {formatPrice(transaction.fee_cents)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">{formatDate(transaction.created_at)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  <span className="font-medium">{getStatusText(transaction.status)}</span>
                </div>
              </div>

              {transaction.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Método de Pagamento:</span>
                  <span className="font-medium capitalize">
                    {transaction.payment_method.replace('_', ' ')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Group Information (if applicable) */}
          {transaction.groupName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Informações do Grupo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nome do Grupo:</span>
                  <span className="font-medium">{transaction.groupName}</span>
                </div>
                
                {transaction.groupId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ID do Grupo:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {transaction.groupId}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Participant Information (if applicable) */}
          {transaction.participantName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Participante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{transaction.participantName}</span>
                </div>
                
                {transaction.participantId && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">ID do Participante:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {transaction.participantId}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tipo de Transação:</span>
                <span className={`font-medium px-3 py-1 rounded-full ${
                  transaction.amount_cents > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {getTransactionTypeLabel(transaction.type)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Processado em:</span>
                <span className="font-medium">{formatDate(transaction.created_at)}</span>
              </div>

              {transaction.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-1">Transação Pendente</h4>
                      <p className="text-sm text-yellow-800">
                        Esta transação está sendo processada. Você será notificado quando for concluída.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {transaction.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900 mb-1">Transação Falhou</h4>
                      <p className="text-sm text-red-800">
                        Esta transação não pôde ser processada. Entre em contato com o suporte se necessário.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button 
            onClick={() => navigate('/creditos')}
            variant="outline"
            className="flex-1"
          >
            Voltar aos Créditos
          </Button>
          <Button 
            onClick={() => navigate('/creditos/adicionar')}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Adicionar Créditos
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DetalhesTransacao; 