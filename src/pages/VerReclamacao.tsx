import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Send, Paperclip, AlertTriangle, MessageCircle, Clock, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const VerReclamacao: React.FC = () => {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [complaint, setComplaint] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados da reclamação
  useEffect(() => {
    const loadComplaint = async () => {
      if (!complaintId) return;

      try {
        // Buscar reclamação básica primeiro
        const { data: complaintData, error: complaintError } = await supabase
          .from('complaints')
          .select('*')
          .eq('id', complaintId)
          .single();

        if (complaintError) throw complaintError;

        // Buscar dados do grupo
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('name')
          .eq('id', complaintData.group_id)
          .single();

        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', complaintData.user_id)
          .single();

        // Combinar os dados
        const complaintWithDetails = {
          ...complaintData,
          group_name: groupData?.name || 'Grupo não encontrado',
          user_name: userData?.full_name || 'Usuário não encontrado'
        };

        setComplaint(complaintWithDetails);

        // Buscar mensagens da reclamação
        const { data: messagesData, error: messagesError } = await supabase
          .from('complaint_messages')
          .select('*')
          .eq('complaint_id', complaintId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

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

        setMessages(messagesWithUserData);

      } catch (error) {
        console.error('Erro ao carregar reclamação:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComplaint();
  }, [complaintId]);

  const handleSendMessage = async () => {
    if (!message.trim() || !complaintId || !user) return;

    try {
      const { error } = await supabase
        .from('complaint_messages')
        .insert({
          complaint_id: complaintId,
          user_id: user.id,
          message: message.trim(),
          message_type: 'user_message'
        });

      if (error) throw error;

      // Recarregar mensagens
      const { data: messagesData } = await supabase
        .from('complaint_messages')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });

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

      setMessages(messagesWithUserData);
      setMessage('');

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCancelComplaint = async () => {
    console.log('Iniciando cancelamento da reclamação:', complaintId);
    
    if (!complaintId || !user) {
      console.log('Dados inválidos:', { complaintId, userId: user?.id });
      return;
    }

    try {
      console.log('Verificando reclamação...');
      
      // Primeiro, verificar se a reclamação existe
      const { data: existingComplaint, error: checkError } = await supabase
        .from('complaints')
        .select('id, status, user_id')
        .eq('id', complaintId)
        .single();

      console.log('Resultado da verificação:', { existingComplaint, checkError });

      if (checkError) {
        console.error('Erro ao verificar reclamação:', checkError);
        return;
      }

      if (!existingComplaint) {
        console.error('Reclamação não encontrada');
        return;
      }

      // Verificar se o usuário é o dono da reclamação
      if (existingComplaint.user_id !== user.id) {
        console.error('Usuário não tem permissão para cancelar esta reclamação');
        return;
      }

      console.log('Atualizando status da reclamação...');
      
      // Tentar atualizar usando RPC primeiro
      const { data: rpcResult, error: rpcError } = await supabase.rpc('cancel_complaint_debug', {
        p_complaint_id: complaintId,
        p_user_id: user.id
      });

      console.log('Resultado RPC:', { rpcResult, rpcError });

      if (rpcError) {
        console.log('RPC falhou, tentando update direto...');
        console.log('Erro detalhado:', rpcError);
        
        // Fallback: tentar update direto com tratamento de erro
        try {
        const { error: updateError } = await supabase
          .from('complaints')
          .update({ 
            status: 'closed',
            closed_at: new Date().toISOString()
          })
          .eq('id', complaintId)
          .eq('user_id', user.id); // Garantir que só o dono pode cancelar
        
        if (updateError) {
          console.log('Erro no update direto:', updateError);
          toast({
            title: "Erro ao cancelar",
            description: "Não foi possível cancelar a reclamação. Tente novamente.",
            variant: "destructive",
          });
          return;
        }
        
        // Se chegou aqui, o update funcionou
        console.log('Reclamação cancelada com sucesso via update direto');
        
        // Adicionar mensagem de sistema
        await supabase
          .from('complaint_messages')
          .insert({
            complaint_id: complaintId,
            user_id: user.id,
            message_type: 'system_message',
            message: 'Reclamação cancelada pelo usuário'
          });
        
        // Recarregar dados
        window.location.reload();
        
        toast({
          title: "Reclamação cancelada",
          description: "A reclamação foi cancelada com sucesso.",
        });
        
      } catch (error) {
        console.log('Erro geral:', error);
        toast({
          title: "Erro ao cancelar",
          description: "Ocorreu um erro inesperado. Tente novamente.",
          variant: "destructive",
        });
      }
          } else {
        // RPC funcionou!
        console.log('RPC funcionou! Reclamação cancelada com sucesso');
        console.log('Resultado detalhado:', rpcResult);
        
        // Verificar se realmente foi atualizado
        if (rpcResult && rpcResult.updated_rows > 0) {
          console.log('Confirmação: Linhas atualizadas:', rpcResult.updated_rows);
          
          // Recarregar dados
          window.location.reload();
          
          toast({
            title: "Reclamação cancelada",
            description: "A reclamação foi cancelada com sucesso.",
          });
        } else {
          console.log('ERRO: RPC retornou sucesso mas nenhuma linha foi atualizada!');
          toast({
            title: "Erro ao cancelar",
            description: "A reclamação não foi cancelada. Tente novamente.",
            variant: "destructive",
          });
        }
        return;
      }

    } catch (error) {
      console.error('Erro ao cancelar reclamação:', error);
      alert('Erro ao cancelar reclamação. Tente novamente.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'admin_responded':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Aguardando resposta do administrador';
      case 'admin_responded':
        return 'Administrador respondeu';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando reclamação...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Reclamação não encontrada</h2>
            <p className="text-gray-600 mb-4">A reclamação que você está procurando não existe ou foi removida.</p>
            <Button onClick={handleBack} className="w-full">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    <h1 className="text-2xl font-bold text-gray-900">Reclamação</h1>
                    <p className="text-sm text-gray-600">{complaint.group_name} - {complaint.service_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(complaint.status)}
                    <span className="text-sm font-medium text-gray-700">
                      {getStatusText(complaint.status)}
                    </span>
                  </div>
                  
                  {/* Botão de cancelar reclamação (só para reclamações ativas) */}
                  {complaint.status !== 'closed' && complaint.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelComplaint}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar reclamação
                    </Button>
                  )}
                </div>
              </div>

              {/* Informações da reclamação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Problema relatado</h3>
                    <p className="text-sm text-gray-900">{complaint.problem_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Solução desejada</h3>
                    <p className="text-sm text-gray-900">{complaint.desired_solution}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Criada em</h3>
                    <p className="text-sm text-gray-900">
                      {new Date(complaint.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Prazo para resposta do admin</h3>
                    <p className="text-sm text-gray-900">
                      {new Date(complaint.admin_response_deadline).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Intervenção da JuntaPlay</h3>
                    <p className="text-sm text-gray-900">
                      {new Date(complaint.intervention_deadline).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Mensagens</h3>
                    <p className="text-sm text-gray-900">{complaint.message_count || 0}</p>
                  </div>
                </div>
              </div>

              {/* Aviso de intervenção */}
              <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-sm text-cyan-800">
                  Se você e o administrador não puderem chegar a um acordo, a JuntaPlay vai intervir e ajudar a partir do dia{' '}
                  {new Date(complaint.intervention_deadline).toLocaleDateString('pt-BR')}. 
                  Serão usadas as informações apresentadas aqui para avaliar a sua reclamação.
                </p>
              </div>

              {/* Mensagens */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de mensagens</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-cyan-600">
                            {msg.user_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">{msg.user_name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma mensagem ainda</p>
                    </div>
                  )}
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
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Anexar arquivo
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!message.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar mensagem
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerReclamacao; 