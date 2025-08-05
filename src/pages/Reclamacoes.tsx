import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, Clock, MessageCircle, CheckCircle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Complaint {
  id: string;
  group_name: string;
  service_name: string;
  problem_type: string;
  status: string;
  created_at: string;
  message_count: number;
  admin_response_deadline: string;
  intervention_deadline: string;
}

const Reclamacoes: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComplaints = async () => {
      if (!user) return;

      try {
        // Buscar reclamações do usuário usando a função do banco
        const { data, error } = await supabase
          .rpc('get_user_complaints', { user_uuid: user.id });

        if (error) throw error;

        setComplaints(data || []);
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
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Minhas Reclamações</h1>
              <p className="text-sm text-gray-600">Acompanhe todas as suas reclamações</p>
            </div>
          </div>
          <Button onClick={() => navigate('/groups')} className="bg-cyan-500 hover:bg-cyan-600">
            <Plus className="w-4 h-4 mr-2" />
            Nova Reclamação
          </Button>
        </div>

        {/* Lista de Reclamações */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reclamação encontrada</h3>
                <p className="text-gray-600 mb-4">
                  Você ainda não tem reclamações. Se precisar abrir uma reclamação, 
                  acesse um grupo e clique em "Abrir Reclamação".
                </p>
                <Button onClick={() => navigate('/groups')} className="bg-cyan-500 hover:bg-cyan-600">
                  Ver Grupos
                </Button>
              </CardContent>
            </Card>
          ) : (
            complaints.map((complaint) => (
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
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Problema:</span> {getProblemTypeText(complaint.problem_type)}
                        </p>
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
                          <p className="text-xs text-gray-500">
                            Prazo admin: {new Date(complaint.admin_response_deadline).toLocaleDateString('pt-BR')}
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

        {/* Informações Adicionais */}
        {complaints.length > 0 && (
          <div className="mt-8 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
            <h3 className="text-sm font-medium text-cyan-800 mb-2">Como funciona o sistema de reclamações?</h3>
            <ul className="text-sm text-cyan-700 space-y-1">
              <li>• O administrador tem 7 dias para responder sua reclamação</li>
              <li>• Se não houver acordo, a JuntaPlay intervém após 14 dias</li>
              <li>• Você pode enviar mensagens adicionais a qualquer momento</li>
              <li>• Todas as informações são usadas para avaliar sua reclamação</li>
            </ul>
          </div>
                 )}
       </div>
       <Footer />
     </div>
   );
 };

export default Reclamacoes; 