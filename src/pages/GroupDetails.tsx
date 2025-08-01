import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  Zap, 
  ArrowLeft, 
  Shield, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [group, setGroup] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;

      // Fetch service details
      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('id', groupData.service_id)
        .single();

      // Fetch admin profile
      const { data: adminData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', groupData.admin_id)
        .single();

      // Fetch group members
      const { data: membersData } = await supabase
        .from('group_memberships')
        .select(`
          *,
          profiles!group_memberships_user_id_fkey (
            full_name,
            verification_status
          )
        `)
        .eq('group_id', id);

      setGroup(groupData);
      setService(serviceData);
      setAdmin(adminData);
      setMembers(membersData || []);

    } catch (error) {
      console.error('Error fetching group details:', error);
      toast({
        title: "Erro ao carregar grupo",
        description: "Não foi possível carregar os detalhes do grupo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setJoining(true);
    try {
      // Check if user is already a member
      const { data: existingMembership } = await supabase
        .from('group_memberships')
        .select('*')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .single();

      if (existingMembership) {
        toast({
          title: "Você já participa deste grupo",
          description: "Você já é membro deste grupo",
          variant: "destructive"
        });
        return;
      }

      // For now, just show join modal
      navigate(`/group/${id}/join`);

    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Erro ao entrar no grupo",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setJoining(false);
    }
  };

  const getStatusConfig = (status: string, instantAccess: boolean) => {
    if (instantAccess) {
      return {
        badge: "Acesso Imediato",
        variant: "default" as const,
        icon: <Zap className="h-4 w-4" />
      };
    }
    
    switch (status) {
      case 'waiting_subscription':
        return {
          badge: "Aguardando Assinatura",
          variant: "secondary" as const,
          icon: <Clock className="h-4 w-4" />
        };
      case 'queue':
        return {
          badge: "Fila de Espera",
          variant: "outline" as const,
          icon: <Clock className="h-4 w-4" />
        };
      case 'active_with_slots':
        return {
          badge: "Vagas Disponíveis",
          variant: "default" as const,
          icon: <Users className="h-4 w-4" />
        };
      default:
        return {
          badge: "Disponível",
          variant: "secondary" as const,
          icon: <Users className="h-4 w-4" />
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Grupo não encontrado</h1>
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const statusConfig = getStatusConfig(group.status, group.instant_access);
  const slotsLeft = group.max_members - group.current_members;
  const isAlmostFull = slotsLeft <= 2;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">
                      {service?.name}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground">{group.name}</p>
                  </div>
                  <Badge 
                    variant={statusConfig.variant}
                    className="flex items-center gap-1"
                  >
                    {statusConfig.icon}
                    {statusConfig.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {group.current_members}/{group.max_members}
                    </p>
                    <p className="text-sm text-muted-foreground">vagas disponíveis</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      R$ {(group.price_per_slot_cents / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">por mês</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p className="text-sm font-medium">acesso garantido</p>
                    </div>
                    <p className="text-sm text-muted-foreground">após pagamento</p>
                  </div>
                </div>

                {isAlmostFull && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <p className="font-medium text-orange-700">Últimas vagas!</p>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      Restam apenas {slotsLeft} vaga{slotsLeft !== 1 ? 's' : ''} neste grupo.
                    </p>
                  </div>
                )}

                <p className="text-muted-foreground leading-relaxed">
                  {group.description}
                </p>
              </CardContent>
            </Card>

            {/* Group Rules */}
            {group.rules && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Regras do Grupo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-muted-foreground">
                    {group.rules}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Grupo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Serviço</label>
                  <p className="text-muted-foreground">{service?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <p className="text-muted-foreground capitalize">{service?.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de Relacionamento</label>
                  <p className="text-muted-foreground capitalize">{group.relationship_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Máximo de Usuários</label>
                  <p className="text-muted-foreground">{group.max_members} membros</p>
                </div>
              </CardContent>
            </Card>

            {/* Administrator */}
            <Card>
              <CardHeader>
                <CardTitle>Administrador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {admin?.full_name?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {admin?.full_name || 'Administrador'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={admin?.verification_status === 'verified' ? 'default' : 'secondary'}>
                        {admin?.verification_status === 'verified' ? 'Verificado' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle>Quem faz parte ({members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {member.profiles?.full_name?.charAt(0)?.toUpperCase() || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {member.profiles?.full_name || 'Membro'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Participou em {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Membro
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum membro ainda. Seja o primeiro!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo da Inscrição</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Mensalidade</span>
                    <span className="font-medium">
                      R$ {(group.price_per_slot_cents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de serviço</span>
                    <span className="font-medium">R$ 4,50</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>R$ {((group.price_per_slot_cents + 450) / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    ✓ Acesso imediato após aprovação
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ✓ Suporte via WhatsApp
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ✓ Dados de acesso em até 3 dias
                  </div>
                </div>

                <Button 
                  className="w-full shadow-button" 
                  onClick={handleJoinGroup}
                  disabled={joining || group.current_members >= group.max_members}
                >
                  {joining ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {group.instant_access ? 'Participar Agora' : 'Entrar na Fila'}
                    </div>
                  )}
                </Button>

                {group.current_members >= group.max_members && (
                  <p className="text-sm text-red-500 text-center">
                    Grupo lotado - entre na fila de espera
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Warning Card */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-700 mb-1">
                      Aviso Importante
                    </p>
                    <p className="text-orange-600">
                      Esta plataforma atua apenas como intermediadora financeira. 
                      Não somos afiliados ao {service?.name} ou qualquer outro serviço.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GroupDetails;