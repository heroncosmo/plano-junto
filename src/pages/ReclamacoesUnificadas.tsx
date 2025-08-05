import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  MessageCircle, 
  CheckCircle, 
  Users, 
  Crown,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Complaint {
  id: string;
  group_name: string;
  service_name: string;
  problem_type: string;
  problem_description: string;
  desired_solution: string;
  status: string;
  created_at: string;
  message_count: number;
  admin_response_deadline: string;
  intervention_deadline: string;
  user_name: string;
  user_id: string;
  admin_id: string;
  is_admin: boolean; // Se o usuário atual é admin desta reclamação
}

const ReclamacoesUnificadas: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadComplaints = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Buscar todas as reclamações do usuário (como cliente e como admin)
        const { data: userComplaints, error: userError } = await supabase
          .from('complaints')
          .select(`
            id,
            problem_type,
            problem_description,
            desired_solution,
            status,
            created_at,
            admin_response_deadline,
            intervention_deadline,
            user_id,
            admin_id,
            groups(name)
          `)
          .or(`user_id.eq.${user.id},admin_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (userError) throw userError;

        // Formatar dados e adicionar flag is_admin
        const formattedComplaints = (userComplaints || []).map(complaint => ({
          id: complaint.id,
          group_name: complaint.groups?.name || 'Grupo não encontrado',
          service_name: complaint.groups?.name || 'Serviço do Grupo',
          problem_type: complaint.problem_type,
          problem_description: complaint.problem_description,
          desired_solution: complaint.desired_solution,
          status: complaint.status,
          created_at: complaint.created_at,
          message_count: 0, // Será calculado separadamente
          admin_response_deadline: complaint.admin_response_deadline,
          intervention_deadline: complaint.intervention_deadline,
          user_name: 'Usuário', // Será buscado separadamente
          user_id: complaint.user_id,
          admin_id: complaint.admin_id,
          is_admin: complaint.admin_id === user.id
        }));

        // Buscar nomes dos usuários
        const userIds = [...new Set(formattedComplaints.map(c => c.user_id))];
        const { data: userProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const userNamesMap = new Map(
          (userProfiles || []).map(profile => [profile.user_id, profile.full_name])
        );

        // Calcular contagem de mensagens para cada reclamação
        const complaintsWithMessageCount = await Promise.all(
          formattedComplaints.map(async (complaint) => {
            const { count } = await supabase
              .from('complaint_messages')
              .select('*', { count: 'exact', head: true })
              .eq('complaint_id', complaint.id);

            return {
              ...complaint,
              user_name: userNamesMap.get(complaint.user_id) || 'Usuário não encontrado',
              message_count: count || 0
            };
          })
        );

        setComplaints(complaintsWithMessageCount);
      } catch (error) {
        console.error('Erro ao carregar reclamações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [user]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewComplaint = (complaintId: string) => {
    navigate(`/ver-reclamacao/${complaintId}`);
  };

  const handleNewComplaint = () => {
    navigate('/reclamacao/inicial');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'admin_responded':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'user_responded':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando resposta';
      case 'admin_responded':
        return 'Admin respondeu';
      case 'user_responded':
        return 'Você respondeu';
      case 'resolved':
        return 'Resolvido';
      case 'closed':
        return 'Fechado';
      default:
        return 'Em andamento';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'admin_responded':
        return 'bg-blue-100 text-blue-800';
      case 'user_responded':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProblemTypeText = (problemType: string) => {
    switch (problemType) {
      case 'subscription_stopped':
        return 'Assinatura parou';
      case 'service_different_description':
        return 'Serviço diferente da descrição';
      case 'admin_payment_outside_site':
        return 'Admin pediu pagamento fora do site';
      case 'other':
        return 'Outro problema';
      default:
        return problemType;
    }
  };

  const getUrgencyColor = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline < 0) return 'text-red-600 font-bold';
    if (daysUntilDeadline <= 2) return 'text-orange-600 font-semibold';
    if (daysUntilDeadline <= 5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  // Filtrar reclamações baseado no tab ativo
  const getFilteredComplaints = () => {
    let filtered = complaints;

    // Filtrar por tab
    switch (activeTab) {
      case 'my':
        filtered = filtered.filter(c => !c.is_admin);
        break;
      case 'admin':
        filtered = filtered.filter(c => c.is_admin);
        break;
      case 'all':
      default:
        break;
    }

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.problem_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredComplaints = getFilteredComplaints();

  // Estatísticas
  const stats = {
    total: complaints.length,
    my: complaints.filter(c => !c.is_admin).length,
    admin: complaints.filter(c => c.is_admin).length,
    pending: complaints.filter(c => c.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando reclamações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Minhas Reclamações</h1>
              <p className="text-sm text-gray-600">Gerencie suas reclamações como cliente e administrador</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleNewComplaint} className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Reclamação
            </Button>
          </div>
        </div>

        {/* Estatísticas Minimalistas */}
        <div className="flex items-center justify-center space-x-8 mb-6 text-sm text-gray-600">
          <span>Total: <strong className="text-gray-900">{stats.total}</strong></span>
          <span>Minhas: <strong className="text-blue-600">{stats.my}</strong></span>
          <span>Como Admin: <strong className="text-yellow-600">{stats.admin}</strong></span>
          <span>Pendentes: <strong className="text-orange-600">{stats.pending}</strong></span>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Todas ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="my" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Minhas ({stats.my})
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Como Admin ({stats.admin})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por grupo, problema ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="admin_responded">Admin respondeu</option>
            <option value="user_responded">Você respondeu</option>
            <option value="resolved">Resolvidos</option>
            <option value="closed">Fechados</option>
          </select>
        </div>

        {/* Lista de Reclamações */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'my' ? 'Nenhuma reclamação encontrada' :
                   activeTab === 'admin' ? 'Nenhuma reclamação como administrador' :
                   'Nenhuma reclamação encontrada'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'my' ? 'Você ainda não criou nenhuma reclamação.' :
                   activeTab === 'admin' ? 'Não há reclamações nos seus grupos no momento.' :
                   'Não há reclamações que correspondam aos filtros selecionados.'}
                </p>
                {activeTab === 'my' && (
                  <Button onClick={handleNewComplaint} className="bg-cyan-500 hover:bg-cyan-600">
                    Criar Primeira Reclamação
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow cursor-pointer" 
                    onClick={() => handleViewComplaint(complaint.id)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {complaint.group_name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {complaint.service_name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {complaint.user_name}
                        </Badge>
                        {complaint.is_admin && (
                          <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Problema:</span> {getProblemTypeText(complaint.problem_type)}
                        </p>
                        {complaint.problem_description && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Descrição:</span> {complaint.problem_description.substring(0, 100)}...
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Criada em:</span> {new Date(complaint.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Mensagens:</span> {complaint.message_count}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(complaint.status)}
                          <Badge className={getStatusColor(complaint.status)}>
                            {getStatusText(complaint.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-xs ${getUrgencyColor(complaint.admin_response_deadline)}`}>
                            Prazo: {new Date(complaint.admin_response_deadline).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Intervenção: {new Date(complaint.intervention_deadline).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>


      </div>
      <Footer />
    </div>
  );
};

export default ReclamacoesUnificadas; 