import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<any>(null);

  // Dados da reclamação - serão carregados do localStorage ou URL params
  const [complaintData, setComplaintData] = useState({
    problemType: '',
    problemDescription: '',
    desiredSolution: '',
    status: 'pending',
    interventionDeadline: '',
    messages: [
      {
        id: 1,
        user: 'D',
        message: 'Abertura da reclamação',
        date: new Date().toLocaleDateString('pt-BR'),
        type: 'opening'
      }
    ]
  });

  // Carregar dados preenchidos anteriormente
  useEffect(() => {
    const loadComplaintData = () => {
      // Tentar carregar dados do localStorage
      const savedData = localStorage.getItem(`complaint_data_${groupId}`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setComplaintData(prev => ({
            ...prev,
            ...parsedData,
            interventionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
          }));
        } catch (error) {
          console.error('Erro ao carregar dados salvos:', error);
        }
      } else {
        // Se não há dados salvos, usar dados padrão baseados na URL
        const problemType = searchParams.get('problemType') || 'other';
        const desiredSolution = searchParams.get('desiredSolution') || 'subscription_cancellation_and_refund';
        
        setComplaintData(prev => ({
          ...prev,
          problemType: getProblemTypeText(problemType),
          desiredSolution: getDesiredSolutionText(desiredSolution),
          interventionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
        }));
      }
    };

    loadComplaintData();
  }, [groupId, searchParams]);

  // Funções auxiliares para converter códigos em texto
  const getProblemTypeText = (code: string) => {
    switch (code) {
      case 'subscription_stopped':
        return 'Assinatura parou de funcionar';
      case 'service_different_description':
        return 'Serviço diferente da descrição';
      case 'admin_payment_outside_site':
        return 'Administrador solicitando pagamento fora do site';
      case 'other':
      default:
        return 'Outro motivo';
    }
  };

  const getDesiredSolutionText = (code: string) => {
    switch (code) {
      case 'problem_solution':
        return 'Solução do problema';
      case 'problem_solution_and_refund':
        return 'Solução do problema e reembolso dos dias até a solução';
      case 'subscription_cancellation_and_refund':
        return 'Cancelamento da sua assinatura e reembolso';
      default:
        return 'Cancelamento da sua assinatura e reembolso';
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Adicionar mensagem ao histórico local
      const newMessage = {
        id: Date.now(),
        user: 'D',
        message: message.trim(),
        date: new Date().toLocaleDateString('pt-BR'),
        type: 'user_message'
      };

      setComplaintData(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));

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

  const handleSubmitComplaint = async () => {
    if (!user || !groupId) return;

    setLoading(true);
    try {
      // Buscar dados do grupo
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('admin_id')
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
          problem_type: searchParams.get('problemType') || 'other',
          problem_description: complaintData.problemDescription,
          desired_solution: searchParams.get('desiredSolution') || 'subscription_cancellation_and_refund',
          status: 'pending',
          user_contacted_admin: true,
          admin_response_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          intervention_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar mensagem inicial
      if (complaintData.messages.length > 0) {
        await supabase
          .from('complaint_messages')
          .insert({
            complaint_id: complaint.id,
            user_id: user.id,
            message_type: 'opening',
            message: 'Abertura da reclamação'
          });
      }

      // Adicionar mensagens do usuário
      const userMessages = complaintData.messages.filter(msg => msg.type === 'user_message');
      for (const msg of userMessages) {
        await supabase
          .from('complaint_messages')
          .insert({
            complaint_id: complaint.id,
            user_id: user.id,
            message_type: 'user_message',
            message: msg.message
          });
      }

      // Limpar dados do localStorage
      localStorage.removeItem(`complaint_data_${groupId}`);

      // Navegar para a página de status
      navigate(`/reclamacao/status?groupId=${groupId}&complaintId=${complaint.id}`);

    } catch (error) {
      console.error('Erro ao criar reclamação:', error);
    } finally {
      setLoading(false);
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

              {/* Botão enviar reclamação */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button 
                  onClick={handleSubmitComplaint}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                  disabled={loading}
                >
                  {loading ? 'Enviando reclamação...' : 'Enviar reclamação'}
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