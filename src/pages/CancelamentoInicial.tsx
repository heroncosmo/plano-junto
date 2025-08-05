import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertTriangle, Info, User, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  joined_at: string;
  status: string;
  group: {
    name: string;
    price_per_slot_cents: number;
  };
}

interface Complaint {
  id: string;
  status: string;
  created_at: string;
  estimated_closure: string;
}

const CancelamentoInicial: React.FC = () => {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { user } = useAuth();
  const [member, setMember] = useState<GroupMember | null>(null);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysSinceJoined, setDaysSinceJoined] = useState(0);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      setLoading(true);

      // Buscar dados do membership
      const { data: memberData, error: memberError } = await supabase
        .from('group_memberships')
        .select(`
          *,
          group:groups(name, price_per_slot_cents)
        `)
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;

      setMember(memberData);

      // Calcular dias desde que entrou
      const joinedDate = new Date(memberData.joined_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - joinedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysSinceJoined(diffDays);

                           // Verificar se há reclamação em aberto (apenas se temos o groupId)
        if (memberData.group_id) {
          try {
            const { data: complaintData, error: complaintError } = await supabase
              .from('complaints')
              .select('*')
              .eq('user_id', user?.id)
              .eq('group_id', memberData.group_id)
              .in('status', ['pending', 'admin_responded', 'user_responded'])
              .maybeSingle();

            if (complaintData && !complaintError) {
              setComplaint(complaintData);
            }
          } catch (complaintError) {
            console.log('Nenhuma reclamação encontrada ou erro:', complaintError);
          }
        }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (complaint) {
      navigate(`/grupo/membro/${memberId}/cancelamento/reclamacao`);
    } else {
      navigate(`/grupo/membro/${memberId}/cancelamento/motivo`);
    }
  };

  const handleBack = () => {
    if (member?.group_id) {
      navigate(`/grupo/${member.group_id}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleOpenComplaint = () => {
    if (member?.group_id) {
      navigate(`/reclamacao/inicial?group_id=${member.group_id}`);
    }
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

  if (!member) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600">Membro não encontrado</p>
            <Button onClick={handleBack} className="mt-4">Voltar</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Aviso Importante!
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Antes de prosseguir com seu cancelamento precisamos que você saiba sobre algumas informações importantes:
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Ilustração */}
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-blue-600" />
                </div>
              </div>

              {/* Informações do usuário */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Você iniciou sua participação há{' '}
                  <span className="font-semibold text-blue-600">{daysSinceJoined} dias</span>.
                </p>
                {daysSinceJoined < 5 && (
                  <p className="text-sm text-gray-700 mt-2">
                    Se o motivo do cancelamento for um problema no grupo, você deve abrir reclamação.
                  </p>
                )}
              </div>

              {/* Link para reclamação */}
              {daysSinceJoined < 5 && (
                <div className="text-center">
                  <button
                    onClick={handleOpenComplaint}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Quero abrir uma reclamação
                  </button>
                </div>
              )}

              {/* Aviso de atenção */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-semibold mb-2">Atenção!</div>
                  <p className="text-sm">
                    Sair de um grupo que acabou de se formar é prejudicial ao administrador. 
                    Se optar pelo cancelamento de forma imediata você ficará restrito para 
                    participar de grupos por um período de pelo menos 15 dias.
                  </p>
                </AlertDescription>
              </Alert>

              {/* Disclaimer */}
              <div className="text-xs text-red-600 text-center">
                * As taxas de processamento de pagamento não serão estornadas.
              </div>

              {/* Botões */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleProceed}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Prosseguir
                </Button>
                <Button 
                  onClick={handleBack}
                  variant="ghost" 
                  className="w-full text-blue-600 hover:text-blue-800"
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CancelamentoInicial; 