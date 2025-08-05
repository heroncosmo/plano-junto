import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle, Calendar, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Complaint {
  id: string;
  status: string;
  created_at: string;
  estimated_closure: string;
  complaint_number: string;
}

const CancelamentoReclamacao: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [groupId, setGroupId] = useState<string | null>(null);
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    loadComplaintData();
  }, []);

  const loadComplaintData = async () => {
    try {
      setLoading(true);

      // Primeiro buscar o membership para obter o group_id
      const { data: memberData, error: memberError } = await supabase
        .from('group_memberships')
        .select('group_id')
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;
      
      setGroupId(memberData.group_id);

             // Agora buscar a reclamação
       try {
         const { data: complaintData, error } = await supabase
           .from('complaints')
           .select('*')
           .eq('user_id', user?.id)
           .eq('group_id', memberData.group_id)
           .in('status', ['pending', 'admin_responded', 'user_responded'])
           .maybeSingle();

         if (complaintData && !error) {
           setComplaint(complaintData);
         }
       } catch (complaintError) {
         console.log('Nenhuma reclamação encontrada ou erro:', complaintError);
       }

    } catch (error) {
      console.error('Erro ao carregar reclamação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewComplaint = () => {
    navigate(`/reclamacao/status/${complaint?.id}`);
  };

  const handleProceedWithCancellation = async () => {
    if (!agreed) return;

    try {
      // Fechar a reclamação automaticamente
      await supabase
        .from('complaints')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString(),
          closure_reason: 'cancellation'
        })
        .eq('id', complaint?.id);

      // Prosseguir para o cancelamento
      navigate(`/grupo/membro/${memberId}/cancelamento/motivo`);
    } catch (error) {
      console.error('Erro ao processar cancelamento:', error);
    }
  };

  const handleBack = () => {
    navigate(`/grupo/membro/${memberId}/cancelamento/informacoes`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando informações...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600">Reclamação não encontrada</p>
            <Button onClick={handleBack} className="mt-4">Voltar</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-2" />
              <CardTitle className="text-xl font-semibold text-gray-800">
                Reclamação em Aberto
              </CardTitle>
            </div>
            <p className="text-sm text-gray-600">
              Atenção
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Detalhes da reclamação */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reclamação #{complaint.complaint_number}</span>
                  <span className="text-xs text-gray-500">Aberta em {formatDate(complaint.created_at)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Ainda está em análise</span>
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Previsão de Encerramento: {formatDate(complaint.estimated_closure)}</span>
                </div>
              </div>
            </div>

            {/* Aviso sobre cancelamento */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-800 mb-3">
                Se prosseguir com o cancelamento:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-red-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span>A reclamação será encerrada automaticamente</span>
                </div>
                
                <div className="flex items-center text-sm text-red-700">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span>Não haverá estorno proporcional referente à reclamação</span>
                </div>
              </div>
            </div>

            {/* Checkbox de acordo */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreement"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <label 
                htmlFor="agreement" 
                className="text-sm text-gray-700 cursor-pointer"
              >
                Concordo que li e estou de acordo com os termos acima.
              </label>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleViewComplaint}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Visualizar Reclamação
              </Button>
              <Button 
                onClick={handleProceedWithCancellation}
                disabled={!agreed}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
              >
                Prosseguir com Cancelamento
              </Button>
            </div>

            {/* Botão voltar */}
            <Button 
              onClick={handleBack}
              variant="ghost" 
              className="w-full text-blue-600 hover:text-blue-800"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
    
    <Footer />
  </div>
);
};

export default CancelamentoReclamacao; 