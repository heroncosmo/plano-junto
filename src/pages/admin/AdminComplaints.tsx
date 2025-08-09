import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  AlertTriangle, 
  UserCheck, 
  UserX, 
  Eye,
  Copy,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ClientDetailsModal from '@/components/ClientDetailsModal';
import { Textarea } from '@/components/ui/textarea';

interface ComplaintData {
  id: string;
  user_id: string;
  group_id: string;
  admin_id: string;
  problem_type: string;
  problem_description?: string;
  desired_solution: string;
  status: string;
  created_at: string;
  admin_response_deadline: string;
  intervention_deadline: string;
  user_contacted_admin: boolean;
  admin_contacted_user: boolean;
  resolved_at?: string;
  closed_at?: string;
  profiles?: {
    full_name: string;
    user_id: string;
  };
  groups?: {
    name: string;
    services?: {
      name: string;
      icon_url: string;
    };
  };
  admin_profile?: {
    full_name: string;
    user_id: string;
  };
}

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [mediatingComplaint, setMediatingComplaint] = useState<string | null>(null);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<{id: string, name: string} | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
  const [showClosedComplaints, setShowClosedComplaints] = useState(false);
  const [closedComplaints, setClosedComplaints] = useState<ComplaintData[]>([]);
  const [selectedComplaintForDetails, setSelectedComplaintForDetails] = useState<ComplaintData | null>(null);
  const [activeTab, setActiveTab] = useState('todas');
  const [complaintMessages, setComplaintMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mediationMessage, setMediationMessage] = useState('');
  const [mediationDeadline, setMediationDeadline] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadComplaints();
    loadClosedComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoadingComplaints(true);
      
      console.log('🔍 Carregando reclamações ativas...');
      
      // Primeiro buscar as reclamações básicas - APENAS ATIVAS E MAIS RECENTES
      const { data: complaintsData, error } = await supabase
        .from('complaints')
        .select('*')
        .not('status', 'eq', 'closed') // Excluir reclamações fechadas
        .not('status', 'eq', 'resolved') // Excluir reclamações resolvidas
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      console.log('📊 Reclamações encontradas:', complaintsData?.length || 0);
      console.log('📋 Dados das reclamações:', complaintsData);

      if (complaintsData && complaintsData.length > 0) {
        console.log('🎯 Enriquecendo dados das reclamações...');

        // Enriquecer dados das reclamações
        const enrichedComplaints = await Promise.all(
          complaintsData.map(async (complaint) => {
            // Buscar dados do usuário
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name, user_id')
              .eq('user_id', complaint.user_id)
              .single();

            // Buscar dados do grupo
            const { data: groupData } = await supabase
              .from('groups')
              .select(`
                name,
                services:service_id (name, icon_url)
              `)
              .eq('id', complaint.group_id)
              .single();

            // Buscar dados do admin
            const { data: adminData } = await supabase
              .from('profiles')
              .select('full_name, user_id')
              .eq('user_id', complaint.admin_id)
              .single();

            return {
              ...complaint,
              profiles: userData,
              groups: groupData,
              admin_profile: adminData
            };
          })
        );

        setComplaints(enrichedComplaints);
      } else {
        console.log('📭 Nenhuma reclamação ativa encontrada');
        setComplaints([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar reclamações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de reclamações.",
        variant: "destructive",
      });
    } finally {
      setLoadingComplaints(false);
    }
  };

  const loadClosedComplaints = async () => {
    try {
      // Buscar reclamações fechadas para histórico
      const { data: closedData, error } = await supabase
        .from('complaints')
        .select('*')
        .or('status.eq.closed,status.eq.resolved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (closedData && closedData.length > 0) {
        const enrichedClosedComplaints = await Promise.all(
          closedData.map(async (complaint) => {
            // Buscar dados do usuário
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name, user_id')
              .eq('user_id', complaint.user_id)
              .single();

            // Buscar dados do grupo
            const { data: groupData } = await supabase
              .from('groups')
              .select(`
                name,
                services:service_id (name, icon_url)
              `)
              .eq('id', complaint.group_id)
              .single();

            // Buscar dados do admin
            const { data: adminData } = await supabase
              .from('profiles')
              .select('full_name, user_id')
              .eq('user_id', complaint.admin_id)
              .single();

            return {
              ...complaint,
              profiles: userData,
              groups: groupData,
              admin_profile: adminData
            };
          })
        );

        setClosedComplaints(enrichedClosedComplaints);
      } else {
        setClosedComplaints([]);
      }
    } catch (error) {
      console.error('Erro ao carregar reclamações fechadas:', error);
    }
  };

  const handleMediation = async (complaintId: string, action: 'refund' | 'close') => {
    try {
      setMediatingComplaint(complaintId);
      
      let result;
      if (action === 'refund') {
        // Chamar função para aprovar estorno
        const { data, error } = await supabase
          .rpc('process_admin_refund', {
            complaint_id: complaintId,
            admin_user_id: '00000000-0000-0000-0000-000000000000' // UUID dummy para admin do sistema
          });
          
        if (error) throw error;
        result = data;
      } else {
        // Chamar função para fechar sem estorno
        const { data, error } = await supabase
          .rpc('close_complaint_without_refund', {
            complaint_id: complaintId,
            admin_user_id: '00000000-0000-0000-0000-000000000000' // UUID dummy para admin do sistema
          });
          
        if (error) throw error;
        result = data;
      }
      
      if (result?.success) {
        toast({
          title: action === 'refund' ? "Estorno Aprovado" : "Reclamação Fechada",
          description: result.message || "Ação executada com sucesso.",
        });
      } else {
        throw new Error(result?.error || 'Erro ao processar mediação');
      }
      
      await loadComplaints();
      
    } catch (error) {
      console.error('Erro ao processar mediação:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar mediação.",
        variant: "destructive",
      });
    } finally {
      setMediatingComplaint(null);
    }
  };

  const handleManualIntervention = async (complaintId: string, action: 'refund' | 'close') => {
    try {
      setMediatingComplaint(complaintId);
      
      console.log('🔍 DEBUG - Iniciando intervenção manual:', { complaintId, action });
      
      const { data, error } = await supabase.rpc(action === 'refund' ? 'process_admin_refund' : 'close_complaint_without_refund', {
        complaint_id: complaintId,
        admin_user_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID for admin
      });

      console.log('🔍 DEBUG - Resultado da RPC:', { data, error });
      console.log('🔍 DEBUG - Data completo:', JSON.stringify(data, null, 2));
      console.log('🔍 DEBUG - Error completo:', JSON.stringify(error, null, 2));

      if (error) throw error;

      toast({
        title: "Intervenção realizada!",
        description: action === 'refund' 
          ? "Estorno aprovado e processado com sucesso." 
          : "Reclamação fechada sem estorno.",
      });

      // Recarregar reclamações
      loadComplaints();
      loadClosedComplaints();
    } catch (error) {
      console.error('Erro na intervenção manual:', error);
      toast({
        title: "Erro na intervenção",
        description: "Erro ao processar a intervenção manual.",
        variant: "destructive",
      });
    } finally {
      setMediatingComplaint(null);
    }
  };

  const getComplaintStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'admin_responded':
        return 'bg-blue-100 text-blue-800';
      case 'user_responded':
        return 'bg-purple-100 text-purple-800';
      case 'intervention':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplaintStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando Resposta';
      case 'admin_responded':
        return 'Admin Respondeu';
      case 'user_responded':
        return 'Usuário Respondeu';
      case 'intervention':
        return 'Precisa Intervenção';
      case 'resolved':
        return 'Resolvida';
      case 'closed':
        return 'Fechada';
      default:
        return status;
    }
  };

  const isComplaintOverdue = (complaint: ComplaintData) => {
    const now = new Date();
    const deadline = new Date(complaint.admin_response_deadline);
    // Considerar vencida se passou do prazo E não foi resolvida/fechada
    return now > deadline && complaint.status !== 'resolved' && complaint.status !== 'closed';
  };

  const isComplaintReadyForIntervention = (complaint: ComplaintData) => {
    const now = new Date();
    const interventionDeadline = new Date(complaint.intervention_deadline);
    // Pronta para intervenção se passou do prazo de intervenção E não foi resolvida/fechada
    return now > interventionDeadline && complaint.status !== 'resolved' && complaint.status !== 'closed';
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const openClientDetails = (clientId: string, clientName: string) => {
    setSelectedClientForDetails({ id: clientId, name: clientName });
  };

  const openComplaintDetails = async (complaint: ComplaintData) => {
    setSelectedComplaintForDetails(complaint);
    await loadComplaintMessages(complaint.id);
  };

  const closeComplaintDetails = () => {
    setSelectedComplaintForDetails(null);
    setComplaintMessages([]);
    setMediationMessage('');
    setMediationDeadline('');
  };

  const loadComplaintMessages = async (complaintId: string) => {
    try {
      setLoadingMessages(true);
      
      const { data: messagesData, error } = await supabase
        .from('complaint_messages')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Para cada mensagem, buscar dados do usuário
      const messagesWithUserData = await Promise.all(
        (messagesData || []).map(async (message) => {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', message.user_id)
            .single();

          return {
            ...message,
            user_name: userData?.full_name || 'Usuário não encontrado'
          };
        })
      );

      setComplaintMessages(messagesWithUserData);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens da reclamação.",
        variant: "destructive",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMediationMessage = async () => {
    if (!selectedComplaintForDetails || !mediationMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('complaint_messages')
        .insert({
          complaint_id: selectedComplaintForDetails.id,
          user_id: user.id, // Usar o UUID real do admin logado
          message: `📢 MEDIAÇÃO DO SISTEMA:\n\n${mediationMessage.trim()}`,
          message_type: 'system_message'
        });

      if (error) throw error;

      // Recarregar mensagens
      await loadComplaintMessages(selectedComplaintForDetails.id);
      setMediationMessage('');

      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem de mediação foi enviada.",
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem de mediação.",
        variant: "destructive",
      });
    }
  };

  const setMediationDeadlineForComplaint = async () => {
    if (!selectedComplaintForDetails || !mediationDeadline) return;

    try {
      const deadline = new Date(mediationDeadline);
      
      const { error } = await supabase
        .from('complaints')
        .update({
          admin_response_deadline: deadline.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedComplaintForDetails.id);

      if (error) throw error;

      // Adicionar mensagem sobre o prazo e mediação do sistema
      await supabase
        .from('complaint_messages')
        .insert({
          complaint_id: selectedComplaintForDetails.id,
          user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Admin system
          message: `🔄 MEDIAÇÃO DO SISTEMA ATIVADA\n\nA JuntaPlay entrou em mediação para resolver esta reclamação.\n\n⏰ Novo prazo para resposta: ${deadline.toLocaleDateString('pt-BR')} às ${deadline.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n📋 A partir de agora, todas as comunicações devem ser feitas através desta mediação.`,
          message_type: 'system_message'
        });

      // Recarregar mensagens
      await loadComplaintMessages(selectedComplaintForDetails.id);
      setMediationDeadline('');

      toast({
        title: "Prazo definido!",
        description: "Novo prazo foi definido para a reclamação.",
      });
    } catch (error) {
      console.error('Erro ao definir prazo:', error);
      toast({
        title: "Erro",
        description: "Erro ao definir prazo de mediação.",
        variant: "destructive",
      });
    }
  };

  const getMessageTypeLabel = (messageType: string, messageUserId?: string) => {
    // Se é system_message e o user_id é do admin do sistema, mostrar como mediação
    if (messageType === 'system_message' && messageUserId && user?.id === messageUserId) {
      return 'Mediação do Sistema';
    }
    
    switch (messageType) {
      case 'opening':
        return 'Abertura';
      case 'user_message':
        return 'Mensagem do usuário';
      case 'admin_message':
        return 'Resposta do admin';
      case 'system_message':
        return 'Sistema';
      default:
        return 'Mensagem';
    }
  };

  const getMessageTypeColor = (messageType: string) => {
    switch (messageType) {
      case 'admin_mediation':
        return 'bg-blue-100 text-blue-800';
      case 'system_message':
        return 'bg-gray-100 text-gray-800';
      case 'opening':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrar reclamações baseado no estado do filtro
  const filteredComplaints = showOnlyOverdue 
    ? complaints.filter(complaint => isComplaintOverdue(complaint))
    : complaints;

  // Filtrar por aba
  const getComplaintsByTab = () => {
    switch (activeTab) {
      case 'intervencao':
        return complaints.filter(complaint => isComplaintReadyForIntervention(complaint));
      case 'vencidas':
        return complaints.filter(complaint => isComplaintOverdue(complaint) && !isComplaintReadyForIntervention(complaint));
      case 'pendentes':
        return complaints.filter(complaint => complaint.status === 'pending');
      default:
        return filteredComplaints;
    }
  };

  const complaintsByTab = getComplaintsByTab();

  // Contadores para estatísticas
  const overdueComplaints = complaints.filter(complaint => isComplaintOverdue(complaint));
  const readyForIntervention = complaints.filter(complaint => isComplaintReadyForIntervention(complaint));
  const pendingComplaints = complaints.filter(complaint => complaint.status === 'pending');

  // Log para debug
  console.log('📈 Estado atual das reclamações:', {
    total: complaints.length,
    filtered: filteredComplaints.length,
    overdue: overdueComplaints.length,
    readyForIntervention: readyForIntervention.length,
    pending: pendingComplaints.length,
    complaints: complaints.map(c => ({ id: c.id, status: c.status, group: c.groups?.name }))
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sistema de Mediação</h2>
        <p className="text-gray-600">
          Gerencie todas as reclamações do sistema e intervenha quando necessário
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{complaints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-bold">{pendingComplaints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Vencidas</p>
                <p className="text-xl font-bold">{overdueComplaints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Precisam Intervenção</p>
                <p className="text-xl font-bold">{readyForIntervention.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Info - TEMPORÁRIO */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mb-4 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-orange-800 mb-2">🔍 Debug Info</h4>
            <div className="text-sm text-orange-700 space-y-1">
              <p>Total de reclamações carregadas: {complaints.length}</p>
              <p>Reclamações filtradas: {filteredComplaints.length}</p>
              <p>Reclamações pendentes: {pendingComplaints.length}</p>
              <p>Reclamações vencidas: {overdueComplaints.length}</p>
              <p>Precisam intervenção: {readyForIntervention.length}</p>
              {complaints.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium">Reclamações encontradas:</p>
                  <ul className="list-disc list-inside ml-2">
                    {complaints.map((c, i) => (
                      <li key={c.id}>
                        {i + 1}. {c.groups?.name || 'N/A'} - {c.status} - {c.id.substring(0, 8)}...
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sistema de Abas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Todas ({complaints.length})
          </TabsTrigger>
          <TabsTrigger value="intervencao" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Intervenção ({readyForIntervention.length})
          </TabsTrigger>
          <TabsTrigger value="vencidas" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Vencidas ({overdueComplaints.filter(c => !isComplaintReadyForIntervention(c)).length})
          </TabsTrigger>
          <TabsTrigger value="pendentes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pendentes ({pendingComplaints.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {/* Filtros para aba "Todas" */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={showOnlyOverdue ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyOverdue(!showOnlyOverdue)}
                  >
                    {showOnlyOverdue ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mostrando Apenas Vencidas
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-1" />
                        Mostrar Todas
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant={showClosedComplaints ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowClosedComplaints(!showClosedComplaints)}
                  >
                    {showClosedComplaints ? (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Ocultar Fechadas
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Ver Fechadas ({closedComplaints.length})
                      </>
                    )}
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadComplaints();
                    loadClosedComplaints();
                  }}
                  disabled={loadingComplaints}
                >
                  {loadingComplaints ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de reclamações para aba "Todas" */}
          {loadingComplaints ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
              <p>Carregando reclamações...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {showOnlyOverdue ? 'Nenhuma reclamação vencida' : 'Nenhuma reclamação encontrada'}
                </h3>
                <p className="text-gray-600">
                  {showOnlyOverdue 
                    ? 'Não há reclamações vencidas no sistema.'
                    : 'Não há reclamações registradas no sistema.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => renderComplaintCard(complaint))}
            </div>
          )}

          {/* Reclamações fechadas */}
          {showClosedComplaints && closedComplaints.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Reclamações Fechadas</h3>
              <div className="space-y-4">
                {closedComplaints.map((complaint) => renderComplaintCard(complaint, true))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="intervencao" className="space-y-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Reclamações que precisam de intervenção do sistema</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadComplaints();
                    loadClosedComplaints();
                  }}
                  disabled={loadingComplaints}
                >
                  {loadingComplaints ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {readyForIntervention.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma intervenção necessária</h3>
                <p className="text-gray-600">
                  Todas as reclamações estão dentro do prazo ou já foram resolvidas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {readyForIntervention.map((complaint) => renderComplaintCard(complaint))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vencidas" className="space-y-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Reclamações vencidas (aguardando intervenção)</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadComplaints();
                    loadClosedComplaints();
                  }}
                  disabled={loadingComplaints}
                >
                  {loadingComplaints ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {overdueComplaints.filter(c => !isComplaintReadyForIntervention(c)).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma reclamação vencida</h3>
                <p className="text-gray-600">
                  Todas as reclamações estão dentro do prazo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {overdueComplaints.filter(c => !isComplaintReadyForIntervention(c)).map((complaint) => renderComplaintCard(complaint))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Reclamações pendentes (aguardando resposta do admin)</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadComplaints();
                    loadClosedComplaints();
                  }}
                  disabled={loadingComplaints}
                >
                  {loadingComplaints ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {pendingComplaints.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma reclamação pendente</h3>
                <p className="text-gray-600">
                  Não há reclamações aguardando resposta do administrador do grupo.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingComplaints.map((complaint) => renderComplaintCard(complaint))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes da Reclamação */}
      {selectedComplaintForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalhes da Reclamação</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeComplaintDetails}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Informações Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Informações Gerais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="outline" className={getComplaintStatusColor(selectedComplaintForDetails.status)}>
                          {getComplaintStatusLabel(selectedComplaintForDetails.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tipo do Problema:</span>
                        <span className="font-medium">{selectedComplaintForDetails.problem_type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Solução Desejada:</span>
                        <span className="font-medium">{selectedComplaintForDetails.desired_solution}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Criada em:</span>
                        <span className="font-medium">{formatDate(selectedComplaintForDetails.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Prazos</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Prazo Admin:</span>
                        <span className={`font-medium ${isComplaintOverdue(selectedComplaintForDetails) ? 'text-red-600' : ''}`}>
                          {formatDate(selectedComplaintForDetails.admin_response_deadline)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Prazo Intervenção:</span>
                        <span className={`font-medium ${isComplaintReadyForIntervention(selectedComplaintForDetails) ? 'text-red-600' : ''}`}>
                          {formatDate(selectedComplaintForDetails.intervention_deadline)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Dias até intervenção:</span>
                        <span className="font-medium">{getDaysUntilDeadline(selectedComplaintForDetails.intervention_deadline)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedComplaintForDetails.problem_description && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Descrição do Problema</h4>
                    <p className="text-sm text-gray-700">{selectedComplaintForDetails.problem_description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Participantes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Membro:</span>
                        <span className="font-medium">
                          {selectedComplaintForDetails.profiles?.full_name || `ID: ${selectedComplaintForDetails.user_id.substring(0, 8)}...`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Admin do Grupo:</span>
                        <span className="font-medium">
                          {selectedComplaintForDetails.admin_profile?.full_name || `ID: ${selectedComplaintForDetails.admin_id.substring(0, 8)}...`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Grupo:</span>
                        <span className="font-medium">
                          {selectedComplaintForDetails.groups?.name || `ID: ${selectedComplaintForDetails.group_id.substring(0, 8)}...`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Comunicação</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Membro contatou admin:</span>
                        <Badge variant={selectedComplaintForDetails.user_contacted_admin ? "default" : "secondary"} className="text-xs">
                          {selectedComplaintForDetails.user_contacted_admin ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Admin contatou membro:</span>
                        <Badge variant={selectedComplaintForDetails.admin_contacted_user ? "default" : "secondary"} className="text-xs">
                          {selectedComplaintForDetails.admin_contacted_user ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversa */}
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-4">Histórico de Conversa</h4>
                  
                  {loadingMessages ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando mensagens...</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                      {complaintMessages.map((msg) => (
                        <div key={msg.id} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-cyan-600">
                                {getMessageTypeLabel(msg.message_type, msg.user_id) === 'Mediação do Sistema' 
                                  ? 'MS' 
                                  : (msg.user_name?.charAt(0) || 'U')}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {getMessageTypeLabel(msg.message_type, msg.user_id) === 'Mediação do Sistema' 
                                        ? 'Mediação do Sistema' 
                                        : msg.user_name}
                                    </span>
                                    <Badge variant="outline" className={`text-xs ${getMessageTypeColor(msg.message_type)}`}>
                                      {getMessageTypeLabel(msg.message_type, msg.user_id)}
                                    </Badge>
                                  </div>
                                <span className="text-xs text-gray-500">
                                  {formatDate(msg.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{msg.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {complaintMessages.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Nenhuma mensagem ainda</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mediação do Sistema */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-600 mb-4">Mediação do Sistema</h4>
                  
                  <div className="space-y-4">
                    {/* Enviar mensagem de mediação */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enviar mensagem de mediação
                      </label>
                      <Textarea
                        value={mediationMessage}
                        onChange={(e) => setMediationMessage(e.target.value)}
                        placeholder="Digite sua mensagem de mediação..."
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button 
                          onClick={sendMediationMessage} 
                          disabled={!mediationMessage.trim()}
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Mediação
                        </Button>
                      </div>
                    </div>

                    {/* Definir prazo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Definir novo prazo para resposta
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          value={mediationDeadline}
                          onChange={(e) => setMediationDeadline(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <Button 
                          onClick={setMediationDeadlineForComplaint}
                          disabled={!mediationDeadline}
                          size="sm"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Definir Prazo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => navigate(`/group/${selectedComplaintForDetails.group_id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Grupo
                  </Button>
                  
                  <Button
                    onClick={() => openClientDetails(selectedComplaintForDetails.user_id, selectedComplaintForDetails.profiles?.full_name || 'Cliente')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Membro
                  </Button>
                  
                  <Button
                    onClick={() => openClientDetails(selectedComplaintForDetails.admin_id, selectedComplaintForDetails.admin_profile?.full_name || 'Admin')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Admin
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Modal de Detalhes do Cliente */}
       {selectedClientForDetails && (
         <ClientDetailsModal
           userId={selectedClientForDetails.id}
           userName={selectedClientForDetails.name}
           onClose={() => setSelectedClientForDetails(null)}
         />
       )}
    </div>
  );

  // Função para renderizar o card da reclamação
  function renderComplaintCard(complaint: ComplaintData, isClosed: boolean = false) {
    const isOverdue = isComplaintOverdue(complaint);
    const isReadyForIntervention = isComplaintReadyForIntervention(complaint);
    const daysUntilDeadline = getDaysUntilDeadline(complaint.admin_response_deadline);
    
    return (
      <Card key={complaint.id} className={`${
        isReadyForIntervention 
          ? 'border-red-300 bg-red-50' 
          : isOverdue 
            ? 'border-orange-200 bg-orange-50' 
            : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {complaint.groups?.services?.icon_url && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={complaint.groups.services.icon_url} 
                    alt={complaint.groups.services.name}
                    className="w-8 h-8"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">
                  {complaint.groups?.services?.name || complaint.groups?.name || 'Grupo'}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {complaint.groups?.name || `ID: ${complaint.group_id.substring(0, 8)}...`}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className={getComplaintStatusColor(complaint.status)}>
                {getComplaintStatusLabel(complaint.status)}
              </Badge>
              
              {isReadyForIntervention && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  PRECISA INTERVENÇÃO
                </Badge>
              )}
              
              {isOverdue && !isReadyForIntervention && (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Vencida
                </Badge>
              )}
              
              {!isOverdue && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline} dias restantes` : 'Vence hoje'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Informações da Reclamação</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Membro:</span>
                    <span className="font-medium">
                      {complaint.profiles?.full_name || `ID: ${complaint.user_id.substring(0, 8)}...`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Admin do Grupo:</span>
                    <span className="font-medium">
                      {complaint.admin_profile?.full_name || `ID: ${complaint.admin_id.substring(0, 8)}...`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tipo do Problema:</span>
                    <span className="font-medium">{complaint.problem_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Solução Desejada:</span>
                    <span className="font-medium">{complaint.desired_solution}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Status da Comunicação</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Membro contatou admin:</span>
                    <Badge variant={complaint.user_contacted_admin ? "default" : "secondary"} className="text-xs">
                      {complaint.user_contacted_admin ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Admin contatou membro:</span>
                    <Badge variant={complaint.admin_contacted_user ? "default" : "secondary"} className="text-xs">
                      {complaint.admin_contacted_user ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Criada em:</span>
                    <span className="font-medium">{formatDate(complaint.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prazo admin:</span>
                    <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {formatDate(complaint.admin_response_deadline)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {complaint.problem_description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm text-gray-600 mb-2">Descrição do Problema</h4>
                <p className="text-sm text-gray-700">{complaint.problem_description}</p>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => openComplaintDetails(complaint)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-1" />
                Ver Reclamação
              </Button>
              
              <Button
                onClick={() => navigate(`/group/${complaint.group_id}`)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver Grupo
              </Button>
              
              <Button
                onClick={() => openClientDetails(complaint.user_id, complaint.profiles?.full_name || 'Cliente')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver Membro
              </Button>
              
              {/* Botões de intervenção - sempre disponíveis para admin */}
              {!isClosed && (
                <>
                  <Button
                    onClick={() => handleManualIntervention(complaint.id, 'refund')}
                    disabled={mediatingComplaint === complaint.id}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {mediatingComplaint === complaint.id ? 'Processando...' : (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Intermediar (Estorno)
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => handleManualIntervention(complaint.id, 'close')}
                    disabled={mediatingComplaint === complaint.id}
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {mediatingComplaint === complaint.id ? 'Processando...' : (
                      <>
                        <UserX className="h-4 w-4 mr-1" />
                        Intermediar (Fechar)
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {complaint.status === 'closed' && (
                <div className="flex-1 text-center">
                  <Badge variant="secondary" className="text-xs">
                    <XCircle className="h-3 w-3 mr-1" />
                    Fechada
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default AdminComplaints; 