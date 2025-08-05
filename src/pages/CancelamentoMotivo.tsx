import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Heart, DollarSign, Clock, MessageSquare, AlertCircle, X } from 'lucide-react';
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

interface UserStats {
  total_saved: number;
  total_groups: number;
  days_member: number;
}

const CANCELATION_REASONS = [
  { value: 'group_problems', label: 'Tive problemas no grupo' },
  { value: 'no_longer_use', label: 'Não irei mais utilizar o serviço' },
  { value: 'money_tight', label: 'A grana ta curta, vou dar uma economizada' },
  { value: 'group_too_slow', label: 'Muita demora para completar o grupo' },
  { value: 'admin_communication', label: 'Falta de comunicação com o administrador' },
  { value: 'service_issues', label: 'Problemas com o serviço de streaming' },
  { value: 'personal_reasons', label: 'Motivos pessoais' },
  { value: 'found_alternative', label: 'Encontrei uma alternativa melhor' },
  { value: 'technical_issues', label: 'Problemas técnicos' },
  { value: 'other', label: 'Outros' }
];

const CancelamentoMotivo: React.FC = () => {
  const navigate = useNavigate();
  const { groupId, memberId } = useParams();
  const { user } = useAuth();
  const [member, setMember] = useState<GroupMember | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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

      // Calcular estatísticas do usuário
      const joinedDate = new Date(memberData.joined_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - joinedDate.getTime());
      const daysMember = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Buscar total economizado (simulado)
      const totalSaved = 6.31; // Valor simulado baseado no Kotas
      const totalGroups = 1; // Simulado

      setUserStats({
        total_saved: totalSaved,
        total_groups: totalGroups,
        days_member: daysMember
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(`/grupo/membro/${memberId}/cancelamento/confirmacao`);
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

  if (!member || !userStats) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600">Dados não encontrados</p>
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
                Está de saída? Nosso grupo sentirá sua falta 😔
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Vimos que está pensando em cancelar sua assinatura neste grupo. 
                Você pode nos contar o porquê?
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Dropdown de motivos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Selecionar o motivo
                </label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolha um motivo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCELATION_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Estatísticas do usuário */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Você já economizou{' '}
                  <span className="font-semibold text-green-600">
                    R$ {userStats.total_saved.toFixed(2)}
                  </span>{' '}
                  em assinaturas desde que entrou no Kotas! Se você sair deste grupo agora, você irá perder:
                </p>
              </div>

              {/* Benefícios perdidos */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <X className="h-4 w-4 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">
                      Até 80% de desconto no valor das suas assinaturas de streamings e outros serviços.
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <X className="h-4 w-4 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">
                      A chance de ganhar créditos ao indicar amigos.
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <X className="h-4 w-4 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">
                      A garantia de receber o pagamento de quem compartilha o streaming com você, 
                      sem precisar ficar cobrando.
                    </span>
                  </div>
                  
                  <div className="flex items-start">
                    <X className="h-4 w-4 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">
                    A oportunidade de ter todos os streamings pagando um preço bem abaixo do mercado.
                  </span>
                </div>
              </div>
            </div>

            {/* Mensagem de incentivo */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                Se ainda sim decidir deixar o grupo, lembre-se, caso necessite assinar um serviço 
                novamente, nós te ajudamos a economizar e a manter as contas em ordem!
              </p>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleBack}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Continuar utilizando o grupo
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={!selectedReason}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
              >
                Encerrar inscrição
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

export default CancelamentoMotivo; 