import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Plus, Users, CreditCard, Settings, Bell } from 'lucide-react';
import GroupCard from '@/components/GroupCard';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [recommendedGroups, setRecommendedGroups] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setProfile(profileData);

      // Fetch user's groups (as member or admin)
      const { data: membershipData } = await supabase
        .from('group_memberships')
        .select(`
          *,
          groups (
            *,
            services (name, category)
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active');

      const { data: adminGroups } = await supabase
        .from('groups')
        .select(`
          *,
          services (name, category),
          group_memberships (count)
        `)
        .eq('admin_id', user?.id)
        .eq('status', 'active_with_slots');

      setMyGroups([...(membershipData || []), ...(adminGroups || [])]);

      // Fetch recommended groups
      const { data: recommendedData } = await supabase
        .from('groups')
        .select(`
          *,
          services (name, category, icon_url)
        `)
        .eq('admin_approved', true)
        .eq('owner_approved', true)
        .eq('status', 'active_with_slots')
        .neq('admin_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(8);

      setRecommendedGroups(recommendedData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Olá, {profile?.full_name || 'Usuário'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Bem-vindo ao seu painel. Gerencie seus grupos e descubra novas oportunidades de economia.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notificações
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Criar Grupo
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Meus Grupos</p>
                  <p className="text-2xl font-bold">{myGroups.length}</p>
                </div>
                <Users className="h-8 w-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className="text-2xl font-bold">
                    R$ {((profile?.balance_cents || 0) / 100).toFixed(2)}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={profile?.verification_status === 'verified' ? 'default' : 'secondary'}>
                    {profile?.verification_status === 'verified' ? 'Verificado' : 'Pendente'}
                  </Badge>
                </div>
                <Settings className="h-8 w-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Créditos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="meus-grupos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="meus-grupos">Meus Grupos</TabsTrigger>
            <TabsTrigger value="recomendados">Recomendados</TabsTrigger>
            <TabsTrigger value="creditos">Créditos</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="meus-grupos" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Meus Grupos</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Grupo
              </Button>
            </div>

            {myGroups.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    id={group.id}
                    serviceName={group.groups?.services?.name || group.services?.name}
                    groupName={group.groups?.name || group.name}
                    description={group.groups?.description || group.description}
                    pricePerSlot={group.groups?.price_per_slot_cents || group.price_per_slot_cents}
                    currentMembers={group.groups?.current_members || group.current_members}
                    maxMembers={group.groups?.max_members || group.max_members}
                    status={group.groups?.status || group.status}
                    instantAccess={group.groups?.instant_access || group.instant_access}
                    relationshipType={group.groups?.relationship_type || group.relationship_type}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não participa de nenhum grupo. Que tal criar o primeiro?
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Meu Primeiro Grupo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recomendados" className="space-y-6">
            <h2 className="text-xl font-bold">Grupos Recomendados</h2>
            
            {recommendedGroups.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    id={group.id}
                    serviceName={group.services?.name}
                    groupName={group.name}
                    description={group.description}
                    pricePerSlot={group.price_per_slot_cents}
                    currentMembers={group.current_members}
                    maxMembers={group.max_members}
                    status={group.status}
                    instantAccess={group.instant_access}
                    relationshipType={group.relationship_type}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {loadingData ? 'Carregando grupos...' : 'Nenhum grupo disponível no momento.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="creditos" className="space-y-6">
            <h2 className="text-xl font-bold">Gerenciar Créditos</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saldo Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-cyan-600 mb-4">
                    R$ {((profile?.balance_cents || 0) / 100).toFixed(2)}
                  </p>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Créditos
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    💳 Cartão de Crédito
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📱 PIX
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    🏦 Boleto Bancário
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="perfil" className="space-y-6">
            <h2 className="text-xl font-bold">Meu Perfil</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome Completo</label>
                  <p className="text-muted-foreground">
                    {profile?.full_name || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">CPF</label>
                  <p className="text-muted-foreground">
                    {profile?.cpf || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status de Verificação</label>
                  <div className="mt-1">
                    <Badge variant={profile?.verification_status === 'verified' ? 'default' : 'secondary'}>
                      {profile?.verification_status === 'verified' ? 'Verificado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
                <Button>Editar Perfil</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;