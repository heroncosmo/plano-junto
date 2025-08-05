import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { approveGroupByOwner } from '@/integrations/supabase/functions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GroupData {
  id: string;
  name: string;
  description: string;
  admin_id: string;
  admin_approved: boolean;
  owner_approved: boolean;
  status: string;
  current_members: number;
  max_members: number;
  price_per_slot_cents: number;
  services?: {
    name: string;
    icon_url: string;
  };
}

const ManageGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [agreements, setAgreements] = useState({
    isAdmin: false,
    hasPermissions: false,
    isAware: false,
    willSupport: false,
    understands: false
  });
  const [groupReleased, setGroupReleased] = useState(false);

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const loadGroupData = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          services:service_id (
            name,
            icon_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Verificar se o usuário é o admin do grupo
      if (data.admin_id !== user?.id) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para gerenciar este grupo.",
          variant: "destructive",
        });
        navigate('/my-groups');
        return;
      }

      setGroup(data);
    } catch (error) {
      console.error('Erro ao carregar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do grupo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveGroup = async () => {
    if (!group) return;

    // Verificar se todos os acordos foram marcados
    const allAgreed = Object.values(agreements).every(Boolean);
    if (!allAgreed) {
      toast({
        title: "Confirmação necessária",
        description: "Você precisa concordar com todas as condições para liberar o grupo.",
        variant: "destructive",
      });
      return;
    }

    setApproving(true);
    try {
      const result = await approveGroupByOwner(group.id);

      if (result.success) {
        toast({
          title: "Grupo liberado!",
          description: "Seu grupo foi liberado com sucesso e agora pode receber membros.",
        });

        // Mostrar tela de sucesso
        setGroupReleased(true);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao liberar grupo:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao liberar o grupo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Grupo não encontrado</h1>
          <Button onClick={() => navigate('/my-groups')}>Voltar para Meus Grupos</Button>
        </div>
      </div>
    );
  }

  const canApprove = group.admin_approved && !group.owner_approved;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {!groupReleased ? (
            <Card className="p-6">
              <CardContent className="p-0">
                {/* Título */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    Tudo certo para liberar seu grupo?
                  </h1>
                  <p className="text-xs text-gray-600">
                    Para prosseguir com a liberação do grupo, você precisa concordar com algumas premissas de um administrador.
                  </p>
                </div>

                {/* Ilustração */}
                <div className="text-center mb-6">
                                  <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-cyan-600" />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="admin"
                      checked={agreements.isAdmin}
                      onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, isAdmin: !!checked }))}
                      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <label htmlFor="admin" className="text-xs text-gray-900 leading-relaxed">
                      Entendi o que é um administrador.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="permissions"
                      checked={agreements.hasPermissions}
                      onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, hasPermissions: !!checked }))}
                      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <label htmlFor="permissions" className="text-xs text-gray-900 leading-relaxed">
                      Tenho totais condições de garantir aos membros o acesso ao serviço.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="aware"
                      checked={agreements.isAware}
                      onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, isAware: !!checked }))}
                      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <label htmlFor="aware" className="text-xs text-gray-900 leading-relaxed">
                      Sou atento aos e-mails e posso responder rapidamente.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="support"
                      checked={agreements.willSupport}
                      onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, willSupport: !!checked }))}
                      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <label htmlFor="support" className="text-xs text-gray-900 leading-relaxed">
                      Darei suporte aos membros do meu grupo sempre que for necessário.
                    </label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="understands"
                      checked={agreements.understands}
                      onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, understands: !!checked }))}
                      className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                    />
                    <label htmlFor="understands" className="text-xs text-gray-900 leading-relaxed">
                      Estou ciente que ao fornecer contas gratuitas ou de terceiros, poderei ter minha conta suspensa definitivamente da plataforma Kotas.
                    </label>
                  </div>
                </div>

                {/* Botão */}
                <Button 
                  onClick={handleApproveGroup}
                  disabled={approving || !Object.values(agreements).every(Boolean)}
                  className={`w-full text-white text-sm ${
                    Object.values(agreements).every(Boolean) 
                      ? 'bg-cyan-500 hover:bg-cyan-600' 
                      : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                  size="default"
                >
                  {approving ? 'Liberando...' : 'Liberar'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6">
              <CardContent className="p-0">
                {/* Tela de Sucesso */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    Parabéns! Seu grupo está público
                  </h1>
                  <p className="text-xs text-gray-600">
                    Agora seu grupo está ativo e pode receber novos membros. Compartilhe o link e comece a crescer sua comunidade!
                  </p>
                </div>

                {/* Botão para ver o grupo */}
                <Button 
                  onClick={() => navigate(`/group/${group.id}`)}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-sm"
                  size="default"
                >
                  Ver grupo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ManageGroup;
