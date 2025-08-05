import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Crown, CheckCircle, Clock, AlertCircle, Shield, DollarSign, Wallet, BarChart3, FileText, Eye, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { processWithdrawal, getAllClients, getAllTransactions, getClientTransactions, getSystemStats, getCompleteClientInfo } from '@/integrations/supabase/functions';
import { isAdmin } from '@/lib/admin-config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClientDetailsModal from '@/components/ClientDetailsModal';

interface GroupData {
  id: string;
  name: string;
  description: string;
  admin_id: string;
  admin_approved: boolean;
  owner_approved: boolean;
  status: string;
  current_members: number;
  max_members: number;
  price_per_slot_cents: number;
  created_at: string;
  services?: {
    name: string;
    icon_url: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface WithdrawalData {
  id: string;
  user_id: string;
  amount_cents: number;
  pix_key: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processed_at?: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface ClientData {
  user_id: string;
  full_name: string;
  email?: string;
  balance_cents: number;
  created_at: string;
  verification_status?: string;
}

interface TransactionData {
  id: string;
  user_id: string;
  amount_cents: number;
  type: string;
  status: string;
  description?: string;
  payment_method: string;
  created_at: string;
  profiles?: {
    full_name: string;
    user_id: string;
  };
}

interface SystemStats {
  totalClients: number;
  totalTransactions: number;
  totalGroups: number;
  totalBalance: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [pendingGroups, setPendingGroups] = useState<GroupData[]>([]);
  const [approvedGroups, setApprovedGroups] = useState<GroupData[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalData[]>([]);
  const [completedWithdrawals, setCompletedWithdrawals] = useState<WithdrawalData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [selectedClientTransactions, setSelectedClientTransactions] = useState<TransactionData[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<string | null>(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<{id: string, name: string} | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  // Verificar se é admin
  const adminStatus = isAdmin(user?.email);

  useEffect(() => {
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta área.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
    
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar grupos
      await loadGroups();
      
      // Carregar saques
      await loadWithdrawals();
      
      // Carregar dados administrativos
      await loadClients();
      await loadTransactions();
      await loadSystemStats();
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do painel.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      // Buscar grupos pendentes de aprovação
      const { data: pending, error: pendingError } = await supabase
        .from('groups')
        .select(`
          *,
          services:service_id (name, icon_url)
        `)
        .eq('admin_approved', false)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      // Buscar grupos aprovados mas não liberados pelo dono
      const { data: approved, error: approvedError } = await supabase
        .from('groups')
        .select(`
          *,
          services:service_id (name, icon_url)
        `)
        .eq('admin_approved', true)
        .eq('owner_approved', false)
        .order('created_at', { ascending: false });

      if (approvedError) throw approvedError;

      // Buscar dados dos perfis para os grupos pendentes
      const pendingWithProfiles = await Promise.all(
        (pending || []).map(async (group) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_id')
            .eq('user_id', group.admin_id)
            .single();

          return {
            ...group,
            profiles: {
              full_name: profile?.full_name || 'N/A',
              email: group.admin_id // Mostrar o ID por enquanto
            }
          };
        })
      );

      // Buscar dados dos perfis para os grupos aprovados
      const approvedWithProfiles = await Promise.all(
        (approved || []).map(async (group) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_id')
            .eq('user_id', group.admin_id)
            .single();

          return {
            ...group,
            profiles: {
              full_name: profile?.full_name || 'N/A',
              email: group.admin_id // Mostrar o ID por enquanto
            }
          };
        })
      );

      setPendingGroups(pendingWithProfiles);
      setApprovedGroups(approvedWithProfiles);
      
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      throw error;
    }
  };

  const loadWithdrawals = async () => {
    try {
      console.log('🔍 Carregando saques pendentes...');
      
      // Buscar saques pendentes
      const { data: pending, error: pendingError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      console.log('📋 Saques pendentes encontrados:', pending);
      console.log('❌ Erro ao buscar saques pendentes:', pendingError);

      if (pendingError) throw pendingError;

      // Buscar saques concluídos
      const { data: completed, error: completedError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('status', 'completed')
        .order('processed_at', { ascending: false })
        .limit(20);

      console.log('✅ Saques concluídos encontrados:', completed);
      console.log('❌ Erro ao buscar saques concluídos:', completedError);

      if (completedError) throw completedError;

      // Buscar dados dos perfis para os saques pendentes
      const pendingWithProfiles = await Promise.all(
        (pending || []).map(async (withdrawal) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_id')
            .eq('user_id', withdrawal.user_id)
            .single();

          return {
            ...withdrawal,
            profiles: {
              full_name: profile?.full_name || 'N/A',
              email: withdrawal.user_id
            }
          };
        })
      );

      // Buscar dados dos perfis para os saques concluídos
      const completedWithProfiles = await Promise.all(
        (completed || []).map(async (withdrawal) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, user_id')
            .eq('user_id', withdrawal.user_id)
            .single();

          return {
            ...withdrawal,
            profiles: {
              full_name: profile?.full_name || 'N/A',
              email: withdrawal.user_id
            }
          };
        })
      );

      setPendingWithdrawals(pendingWithProfiles);
      setCompletedWithdrawals(completedWithProfiles);
      
    } catch (error) {
      console.error('Erro ao carregar saques:', error);
      throw error;
    }
  };

  const loadClients = async () => {
    try {
      const clientsData = await getAllClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const transactionsData = await getAllTransactions(200);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    }
  };

  const loadSystemStats = async () => {
    try {
      const stats = await getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadClientTransactions = async (clientId: string) => {
    try {
      setLoadingTransactions(true);
      console.log('🔍 Carregando transações para cliente:', clientId);
      
      const clientTransactions = await getClientTransactions(clientId);
      console.log('📋 Transações carregadas:', clientTransactions.length);
      
      setSelectedClientTransactions(clientTransactions);
      setSelectedClientId(clientId);
      
      if (clientTransactions.length === 0) {
        toast({
          title: "Nenhuma transação encontrada",
          description: "Este cliente ainda não possui transações registradas.",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar transações do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações do cliente.",
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const approveGroup = async (groupId: string) => {
    try {
      setApproving(groupId);
      
      const { error } = await supabase
        .from('groups')
        .update({ 
          admin_approved: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Grupo aprovado!",
        description: "O grupo foi aprovado e o dono pode agora liberá-lo.",
      });

      // Recarregar dados
      loadGroups();
      
    } catch (error) {
      console.error('Erro ao aprovar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar o grupo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setApproving(null);
    }
  };

  const completeWithdrawal = async (withdrawalId: string) => {
    try {
      setProcessingWithdrawal(withdrawalId);
      
      const result = await processWithdrawal(withdrawalId);

      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido');
      }

      toast({
        title: "Saque concluído!",
        description: "O saque foi marcado como concluído e o valor foi transferido.",
      });

      // Recarregar dados
      loadWithdrawals();
      
    } catch (error) {
      console.error('Erro ao concluir saque:', error);
      toast({
        title: "Erro",
        description: "Erro ao concluir o saque. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessingWithdrawal(null);
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

  const openClientDetails = (clientId: string, clientName: string) => {
    setSelectedClientForDetails({ id: clientId, name: clientName });
  };

  if (!adminStatus) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const GroupCard = ({ group, showApproveButton = false }: { group: GroupData; showApproveButton?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {group.services?.icon_url && (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <img 
                  src={group.services.icon_url} 
                  alt={group.services.name}
                  className="w-8 h-8"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{group.services?.name}</CardTitle>
              <p className="text-sm text-gray-600">{group.name}</p>
            </div>
          </div>
          <Badge variant={group.admin_approved ? "default" : "secondary"}>
            {group.admin_approved ? "Aprovado" : "Pendente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Criador:</span>
            <span>{group.profiles?.full_name || 'N/A'}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ID do Admin:</span>
            <span className="text-xs font-mono">{group.admin_id.substring(0, 8)}...</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Vagas:</span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {group.current_members}/{group.max_members}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Preço por vaga:</span>
            <span className="font-medium">{formatCurrency(group.price_per_slot_cents)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Criado em:</span>
            <span>{formatDate(group.created_at)}</span>
          </div>
          
          {group.description && (
            <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {group.description}
            </p>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => navigate(`/group/${group.id}`)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Ver Detalhes
            </Button>
            
            {showApproveButton && (
              <Button
                onClick={() => approveGroup(group.id)}
                disabled={approving === group.id}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {approving === group.id ? 'Aprovando...' : 'Aprovar'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const WithdrawalCard = ({ withdrawal, showCompleteButton = false }: { withdrawal: WithdrawalData; showCompleteButton?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{formatCurrency(withdrawal.amount_cents)}</CardTitle>
              <p className="text-sm text-gray-600">Solicitado por {withdrawal.profiles?.full_name || 'N/A'}</p>
            </div>
          </div>
          <Badge variant={withdrawal.status === 'completed' ? "default" : "secondary"}>
            {withdrawal.status === 'completed' ? "Concluído" : "Pendente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Solicitante:</span>
            <span>{withdrawal.profiles?.full_name || 'N/A'}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ID do Usuário:</span>
            <span className="text-xs font-mono">{withdrawal.user_id.substring(0, 8)}...</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Chave PIX:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono">{withdrawal.pix_key}</span>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={() => copyToClipboard(withdrawal.pix_key, `pix-${withdrawal.id}`)}
              >
                {copiedStates[`pix-${withdrawal.id}`] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Valor:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatCurrency(withdrawal.amount_cents)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={() => copyToClipboard((withdrawal.amount_cents / 100).toFixed(2), `value-${withdrawal.id}`)}
              >
                {copiedStates[`value-${withdrawal.id}`] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Solicitado em:</span>
            <span>{formatDateTime(withdrawal.created_at)}</span>
          </div>
          
          {withdrawal.processed_at && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Processado em:</span>
              <span>{formatDateTime(withdrawal.processed_at)}</span>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => openClientDetails(withdrawal.user_id, withdrawal.profiles?.full_name || 'Cliente')}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Cliente
            </Button>
            {showCompleteButton && (
              <Button
                onClick={() => completeWithdrawal(withdrawal.id)}
                disabled={processingWithdrawal === withdrawal.id}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processingWithdrawal === withdrawal.id ? 'Processando...' : 'Marcar como Concluído'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ClientCard = ({ client }: { client: ClientData }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{client.full_name || 'Nome não informado'}</CardTitle>
              <p className="text-sm text-gray-600">Saldo: {formatCurrency(client.balance_cents || 0)}</p>
            </div>
          </div>
          <Badge variant={client.verification_status === 'verified' ? "default" : "secondary"}>
            {client.verification_status === 'verified' ? "Verificado" : "Pendente"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">ID:</span>
            <span className="text-xs font-mono">{client.user_id.substring(0, 8)}...</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Saldo:</span>
            <span className={`font-medium ${client.balance_cents > 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {formatCurrency(client.balance_cents || 0)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Cadastrado em:</span>
            <span>{formatDate(client.created_at)}</span>
          </div>
          
          <Button
            onClick={() => openClientDetails(client.user_id, client.full_name || 'Cliente')}
            size="sm"
            variant="outline"
            className="w-full mt-4"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Tudo Sobre o Cliente
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const TransactionCard = ({ transaction }: { transaction: TransactionData }) => {
    const direction = getTransactionDirection(transaction.type, transaction.amount_cents);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{getTransactionTypeLabel(transaction.type)}</p>
                <p className="text-xs text-gray-600">{transaction.profiles?.full_name || 'N/A'}</p>
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
                <span className="text-xs text-gray-500">{formatDate(transaction.created_at)}</span>
              </div>
            </div>
          </div>
          
          {transaction.description && (
            <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {transaction.description}
            </p>
          )}
          
          <div className="flex justify-end mt-3">
            <Button
              onClick={() => openClientDetails(transaction.user_id, transaction.profiles?.full_name || 'Cliente')}
              size="sm"
              variant="ghost"
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver Cliente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold">Painel de Administração</h1>
            </div>
          </div>

          <Tabs defaultValue="stats" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 text-xs">
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="clients" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Clientes ({clients.length})
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Transações
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Grupos ({pendingGroups.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Aguardando ({approvedGroups.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Saques ({pendingWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Concluídos ({completedWithdrawals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="space-y-4">
              {systemStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-sm text-gray-600">Total de Clientes</h3>
                      <p className="text-2xl font-bold">{systemStats.totalClients}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-sm text-gray-600">Total de Transações</h3>
                      <p className="text-2xl font-bold">{systemStats.totalTransactions}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-sm text-gray-600">Total de Grupos</h3>
                      <p className="text-2xl font-bold">{systemStats.totalGroups}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-sm text-gray-600">Saldo Total do Sistema</h3>
                      <p className="text-2xl font-bold">{formatCurrency(systemStats.totalBalance)}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="clients" className="space-y-4">
              {clients.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                    <p className="text-gray-600">
                      Ainda não há clientes cadastrados no sistema.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <ClientCard key={client.user_id} client={client} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {selectedClientId && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          Transações do cliente: {clients.find(c => c.user_id === selectedClientId)?.full_name || 'N/A'}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ID: {selectedClientId?.substring(0, 8)}...
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClientId(null);
                          setSelectedClientTransactions([]);
                        }}
                      >
                        Ver Todas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {loadingTransactions ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                  <p>Carregando transações...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(selectedClientId ? selectedClientTransactions : transactions).length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {selectedClientId ? 'Cliente sem transações' : 'Nenhuma transação encontrada'}
                        </h3>
                        <p className="text-gray-600">
                          {selectedClientId 
                            ? 'Este cliente ainda não possui transações registradas no sistema.' 
                            : 'Ainda não há transações para exibir.'
                          }
                        </p>
                        {selectedClientId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                              setSelectedClientId(null);
                              setSelectedClientTransactions([]);
                            }}
                          >
                            Ver Todas as Transações
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    (selectedClientId ? selectedClientTransactions : transactions).map((transaction) => (
                      <TransactionCard key={transaction.id} transaction={transaction} />
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingGroups.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum grupo pendente</h3>
                    <p className="text-gray-600">
                      Todos os grupos foram aprovados!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingGroups.map((group) => (
                    <GroupCard key={group.id} group={group} showApproveButton={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {approvedGroups.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum grupo aguardando liberação</h3>
                    <p className="text-gray-600">
                      Todos os grupos aprovados já foram liberados pelos donos.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="withdrawals" className="space-y-4">
              {pendingWithdrawals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum saque pendente</h3>
                    <p className="text-gray-600">
                      Todos os saques foram processados!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingWithdrawals.map((withdrawal) => (
                    <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} showCompleteButton={true} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedWithdrawals.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Wallet className="h-12 w-12 text-cyan-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum saque concluído</h3>
                    <p className="text-gray-600">
                      Ainda não há saques concluídos para exibir.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedWithdrawals.map((withdrawal) => (
                    <WithdrawalCard key={withdrawal.id} withdrawal={withdrawal} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
      
      {/* Client Details Modal */}
      {selectedClientForDetails && (
        <ClientDetailsModal
          userId={selectedClientForDetails.id}
          userName={selectedClientForDetails.name}
          onClose={() => setSelectedClientForDetails(null)}
        />
      )}
    </>
  );
};

export default AdminPanel;
