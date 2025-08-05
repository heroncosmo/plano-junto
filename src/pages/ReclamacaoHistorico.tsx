import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, Paperclip, AlertTriangle, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ReclamacaoHistorico: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('outros');
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Dados da reclamação
  const [complaintData, setComplaintData] = useState({
    problemType: 'Outros',
    desiredSolution: 'Cancelamento da minha inscrição e reembolso',
    status: 'pending',
    interventionDeadline: '2025-08-11',
    messages: [
      {
        id: 1,
        user: 'D',
        message: 'vamos resolver, preciso cancelar por favor me ajude',
        date: '04/08/25',
        type: 'user_message'
      },
      {
        id: 2,
        user: 'D',
        message: 'Abertura da reclamação',
        date: '04/08/25',
        type: 'opening'
      }
    ]
  });

  // Criar reclamação no banco de dados
  useEffect(() => {
    const createComplaint = async () => {
      if (!user || !groupId) return;

      setLoading(true);
      try {
        // Buscar dados do grupo
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*, admin_id, services(*)')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;

        // Criar a reclamação
        const { data: complaint, error } = await supabase
          .from('complaints')
          .insert({
            user_id: user.id,
            group_id: groupId,
            admin_id: groupData.admin_id,
            problem_type: 'other',
            desired_solution: 'subscription_cancellation_and_refund',
            status: 'pending',
            user_contacted_admin: true,
            admin_response_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            intervention_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        setComplaint(complaint);
        setComplaintData(prev => ({
          ...prev,
          interventionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
        }));

      } catch (error) {
        console.error('Erro ao criar reclamação:', error);
      } finally {
        setLoading(false);
      }
    };

    createComplaint();
  }, [user, groupId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Aqui seria enviada a mensagem para o banco
      console.log('Enviando mensagem:', message);
      setMessage('');
    }
  };

  const handleAttachComment = () => {
    // Lógica para anexar comentário
    console.log('Anexando comentário');
  };

  const handleAttachEvidence = () => {
    // Lógica para anexar evidência
    console.log('Anexando evidência');
  };

  const handleSubmitComplaint = () => {
    if (complaint) {
      navigate(`/reclamacao/status?groupId=${groupId}`);
    }
  };

  const handleBack = () => {
    if (groupId) {
      navigate(`/reclamacao/solucao-desejada?groupId=${groupId}`);
    } else {
      navigate('/reclamacao/solucao-desejada');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Histórico da reclamação</h1>
                    <p className="text-sm text-gray-600">Adicione informações importantes para a resolução</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Pendente</span>
                </div>
              </div>

              {/* Informações da reclamação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Problema relatado</h3>
                    <p className="text-sm text-gray-900">{complaintData.problemType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Solução desejada</h3>
                    <p className="text-sm text-gray-900">{complaintData.desiredSolution}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Intervenção da JuntaPlay</h3>
                    <p className="text-sm text-gray-900">{complaintData.interventionDeadline}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
                    <p className="text-sm text-gray-900">{complaintData.status}</p>
                  </div>
                </div>
              </div>

              {/* Aviso de intervenção */}
              <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-sm text-cyan-800">
                  Se você e o administrador não puderem chegar a um acordo, a JuntaPlay vai intervir e ajudar a partir do dia{' '}
                  {complaintData.interventionDeadline}. 
                  Serão usadas as informações apresentadas aqui para avaliar a sua reclamação.
                </p>
              </div>

              {/* Mensagens */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de mensagens</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {complaintData.messages.map((msg) => (
                    <div key={msg.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-cyan-600">{msg.user}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">Você</span>
                            <span className="text-xs text-gray-500">{msg.date}</span>
                          </div>
                          <p className="text-sm text-gray-700">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enviar mensagem */}
              <div className="space-y-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[100px]"
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleAttachComment}>
                      <Paperclip className="w-4 h-4 mr-2" />
                      Anexar comentário
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAttachEvidence}>
                      <Paperclip className="w-4 h-4 mr-2" />
                      Anexar evidência
                    </Button>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar mensagem
                  </Button>
                </div>
              </div>

              {/* Botão finalizar */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button 
                  onClick={handleSubmitComplaint}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                  disabled={loading}
                >
                  {loading ? 'Criando reclamação...' : 'Finalizar reclamação'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReclamacaoHistorico; 