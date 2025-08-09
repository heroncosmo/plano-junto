import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  category: string;
  max_users: number;
}

interface PlanOption {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  priceTotal: number;
  pricePerUser: number;
  relationshipType: string;
}

interface GroupInfo {
  name: string;
  description: string;
  rules: string;
  relationshipType: string;
  site: string;
  pricePerSlot: number;
}

interface Fidelity {
  id: string;
  months: number | null;
}

const CreateGroupConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { service, plan, groupInfo, fidelity } = location.state || {};

  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCreateGroup = async () => {
    if (!user || !service || !plan || !groupInfo) {
      toast({
        title: "Erro",
        description: "Informações incompletas para criar o grupo",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          admin_id: user.id,
          service_id: service.id,
          name: groupInfo.name,
          description: groupInfo.description,
          rules: `Não compartilhe a senha e ${groupInfo.rules || 'siga as regras do serviço'}`,
          relationship_type: groupInfo.relationshipType,
          max_members: plan.maxUsers,
          price_per_slot_cents: groupInfo.pricePerSlot,
          status: 'waiting_subscription',
          instant_access: false,
          admin_approved: true,
          owner_approved: false,
          fidelity_months: fidelity?.months || null,
          situation: 'O grupo será analisado pela equipe do JuntaPlay',
          other_info: `Site: ${groupInfo.site}`
        })
        .select()
        .single();

      if (error) throw error;

      // Para grupos baseados em serviços pré-aprovados, liberar automaticamente
      if (service.pre_approved) {
        const { error: releaseError } = await supabase
          .from('groups')
          .update({ owner_approved: true, status: 'active_with_slots' })
          .eq('id', data.id);

        if (releaseError) {
          console.error('Erro ao liberar grupo automaticamente:', releaseError);
        }
      }

      setIsSuccess(true);

      toast({
        title: "Grupo criado com sucesso!",
        description: service.pre_approved ? "Seu grupo está ativo e disponível!" : "Seu grupo será analisado pela nossa equipe"
      });

    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast({
        title: "Erro ao criar grupo",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackToApp = () => {
    navigate('/app');
  };

  if (!service || !plan || !groupInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Informações não encontradas</p>
            <Button onClick={() => navigate('/create-group')} className="mt-4">
              Voltar ao início
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardContent className="p-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4 text-green-800">
                Grupo criado com sucesso!
              </h1>
              <p className="text-muted-foreground mb-6">
                Seu grupo "{groupInfo.name}" foi enviado para análise da nossa equipe. 
                Você receberá uma notificação assim que for aprovado.
              </p>
              
              <div className="space-y-4">
                <div className="text-left bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Próximos passos:</h3>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Seu grupo será analisado (até 24h)</li>
                    <li>Você receberá uma notificação por email</li>
                    <li>Grupo aprovado ficará disponível para receber membros</li>
                    <li>Envio de acesso será feito quando o grupo completar</li>
                  </ol>
                </div>
                
                <Button onClick={handleBackToApp} className="w-full">
                  OK, entendi
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Warning Banner */}
        <Card className="mb-6 bg-orange-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold text-orange-900 mb-2">
                  Seu grupo será analisado
                </h2>
                <p className="text-sm text-orange-800">
                  Todo grupo criado será analisado pela nossa tima de aprovação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Próximos passos</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </div>
                <p className="text-sm">Seu grupo foi criado e será analisado pela aprovação.</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </div>
                <p className="text-sm">Seu grupo estará em análise pela aprovação.</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </div>
                <p className="text-sm">Grupo foi aprovado. Necessário liberar para receber membros.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Group Button */}
        <div className="text-center">
          <Button 
            onClick={handleCreateGroup}
            disabled={isCreating}
            size="lg"
            className="w-full max-w-md"
          >
            {isCreating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>OK, entender</span>
              </div>
            ) : (
              'OK, entendi'
            )}
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateGroupConfirmation;