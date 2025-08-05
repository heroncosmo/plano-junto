import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Copy, 
  Check, 
  User, 
  CreditCard, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Crown,
  Wallet,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCompleteClientInfo } from '@/integrations/supabase/functions';

interface ClientDetailsModalProps {
  userId: string | null;
  userName: string;
  onClose: () => void;
}

interface CompleteClientInfo {
  profile: any;
  transactions: any[];
  adminGroups: any[];
  memberGroups: any[];
  withdrawals: any[];
  stats: {
    totalDeposited: number;
    totalSpent: number;
    totalWithdrawn: number;
    currentBalance: number;
    totalGroups: number;
    totalTransactions: number;
  };
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ userId, userName, onClose }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<CompleteClientInfo | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  useEffect(() => {
    if (userId) {
      loadClientInfo();
    }
  }, [userId]);

  const loadClientInfo = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const info = await getCompleteClientInfo(userId);
      setClientInfo(info);
    } catch (error) {
      console.error('Erro ao carregar informações do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as informações do cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [key]: true });
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência.",
      });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto.",
        variant: "destructive",
      });
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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

  const getTransactionDirection = (type: string, amount: number) => {
    const incomingTypes = ['credit_purchase', 'balance_adjustment'];
    const outgoingTypes = ['group_payment', 'withdrawal', 'admin_fee'];
    
    if (incomingTypes.includes(type) || amount > 0) {
      return { symbol: '+', color: 'text-green-600' };
    } else if (outgoingTypes.includes(type) || amount < 0) {
      return { symbol: '-', color: 'text-red-600' };
    }
    return { symbol: '', color: 'text-gray-600' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">Perfil Completo do Cliente</h2>
              <p className="text-sm text-gray-600">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
            >
              {showSensitiveData ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ocultar Dados
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar Dados
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Carregando informações...</span>
            </div>
          ) : clientInfo ? (
            <div className="p-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wallet className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Saldo Atual</p>
                    <p className="font-bold text-lg">{formatCurrency(clientInfo.stats.currentBalance)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Total Depositado</p>
                    <p className="font-bold text-lg">{formatCurrency(clientInfo.stats.totalDeposited)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Total Gasto</p>
                    <p className="font-bold text-lg">{formatCurrency(clientInfo.stats.totalSpent)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Total de Grupos</p>
                    <p className="font-bold text-lg">{clientInfo.stats.totalGroups}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="profile">Perfil</TabsTrigger>
                  <TabsTrigger value="transactions">Transações ({clientInfo.transactions.length})</TabsTrigger>
                  <TabsTrigger value="admin-groups">Admin ({clientInfo.adminGroups.length})</TabsTrigger>
                  <TabsTrigger value="member-groups">Membro ({clientInfo.memberGroups.length})</TabsTrigger>
                  <TabsTrigger value="withdrawals">Saques ({clientInfo.withdrawals.length})</TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Nome:</span>
                            <span className="font-medium">{clientInfo.profile.full_name || 'Não informado'}</span>
                          </div>
                          
                                                     <div className="flex items-center justify-between">
                             <span className="text-sm text-gray-600">Email:</span>
                             <div className="flex items-center gap-2">
                               <span className="font-medium text-xs">
                                 {showSensitiveData 
                                   ? (clientInfo.profile.email || userId) 
                                   : '***@***.com'
                                 }
                               </span>
                               {showSensitiveData && (
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => copyToClipboard(clientInfo.profile.email || userId, 'email')}
                                 >
                                   {copiedStates['email'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                 </Button>
                               )}
                             </div>
                           </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">CPF:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{showSensitiveData ? (clientInfo.profile.cpf || 'Não informado') : '***.***.***-**'}</span>
                              {showSensitiveData && clientInfo.profile.cpf && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(clientInfo.profile.cpf, 'cpf')}
                                >
                                  {copiedStates['cpf'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Telefone:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{showSensitiveData ? (clientInfo.profile.phone || 'Não informado') : '(**) *****-****'}</span>
                              {showSensitiveData && clientInfo.profile.phone && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(clientInfo.profile.phone, 'phone')}
                                >
                                  {copiedStates['phone'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Chave PIX:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{showSensitiveData ? (clientInfo.profile.pix_key || 'Não informado') : '***'}</span>
                              {showSensitiveData && clientInfo.profile.pix_key && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(clientInfo.profile.pix_key, 'pix')}
                                >
                                  {copiedStates['pix'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status:</span>
                            <Badge variant={clientInfo.profile.verification_status === 'verified' ? "default" : "secondary"}>
                              {clientInfo.profile.verification_status === 'verified' ? 'Verificado' : 'Pendente'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Cadastrado em:</span>
                            <span className="font-medium">{formatDate(clientInfo.profile.created_at)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Última atualização:</span>
                            <span className="font-medium">{formatDate(clientInfo.profile.updated_at)}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">ID do Cliente:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs font-mono">{userId.substring(0, 8)}...</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(userId, 'userId')}
                              >
                                {copiedStates['userId'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions">
                  <div className="space-y-3">
                    {clientInfo.transactions.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Nenhuma transação</h3>
                          <p className="text-gray-600">Este cliente ainda não possui transações.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      clientInfo.transactions.map((transaction) => {
                        const direction = getTransactionDirection(transaction.type, transaction.amount_cents);
                        return (
                          <Card key={transaction.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{getTransactionTypeLabel(transaction.type)}</p>
                                    <p className="text-xs text-gray-600">{transaction.description || 'Sem descrição'}</p>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className={`font-medium ${direction.color}`}>
                                    {direction.symbol}{formatCurrency(Math.abs(transaction.amount_cents))}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`text-xs ${getStatusColor(transaction.status)}`}>
                                      {transaction.status}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{formatDateTime(transaction.created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </TabsContent>

                {/* Admin Groups Tab */}
                <TabsContent value="admin-groups">
                  <div className="space-y-3">
                    {clientInfo.adminGroups.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Crown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Nenhum grupo administrado</h3>
                          <p className="text-gray-600">Este cliente não é administrador de nenhum grupo.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      clientInfo.adminGroups.map((group) => (
                        <Card key={group.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {group.services?.icon_url && (
                                  <img src={group.services.icon_url} alt="" className="w-10 h-10 rounded" />
                                )}
                                <div>
                                  <p className="font-medium">{group.services?.name}</p>
                                  <p className="text-sm text-gray-600">{group.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(group.price_per_slot_cents)}</p>
                                <p className="text-xs text-gray-500">{group.current_members}/{group.max_members} membros</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Member Groups Tab */}
                <TabsContent value="member-groups">
                  <div className="space-y-3">
                    {clientInfo.memberGroups.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Não participa de grupos</h3>
                          <p className="text-gray-600">Este cliente não é membro de nenhum grupo.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      clientInfo.memberGroups.map((membership) => (
                        <Card key={membership.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {membership.groups?.services?.icon_url && (
                                  <img src={membership.groups.services.icon_url} alt="" className="w-10 h-10 rounded" />
                                )}
                                <div>
                                  <p className="font-medium">{membership.groups?.services?.name}</p>
                                  <p className="text-sm text-gray-600">{membership.groups?.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(membership.paid_amount_cents)}</p>
                                <p className="text-xs text-gray-500">Entrou em {formatDate(membership.joined_at)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                {/* Withdrawals Tab */}
                <TabsContent value="withdrawals">
                  <div className="space-y-3">
                    {clientInfo.withdrawals.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Nenhum saque</h3>
                          <p className="text-gray-600">Este cliente ainda não solicitou saques.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      clientInfo.withdrawals.map((withdrawal) => (
                        <Card key={withdrawal.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                  <Wallet className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{formatCurrency(withdrawal.amount_cents)}</p>
                                  <p className="text-xs text-gray-600">
                                    PIX: {showSensitiveData ? withdrawal.pix_key : '***'}
                                    {showSensitiveData && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2 p-1 h-auto"
                                        onClick={() => copyToClipboard(withdrawal.pix_key, `pix-${withdrawal.id}`)}
                                      >
                                        {copiedStates[`pix-${withdrawal.id}`] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                      </Button>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className={getStatusColor(withdrawal.status)}>
                                  {withdrawal.status === 'completed' ? 'Concluído' : withdrawal.status === 'pending' ? 'Pendente' : withdrawal.status}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">{formatDateTime(withdrawal.created_at)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-gray-500">Erro ao carregar informações do cliente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;