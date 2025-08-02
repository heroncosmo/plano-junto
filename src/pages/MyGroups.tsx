import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Crown, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserGroups } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Group {
  id: string;
  name: string;
  description: string;
  max_members: number;
  current_members: number;
  price_per_slot_cents: number;
  status: string;
  relationship_type: string;
  created_at: string;
  services?: {
    name: string;
    category: string;
    icon_url: string;
  };
}

interface GroupMembership {
  id: string;
  paid_amount_cents: number;
  joined_at: string;
  groups: Group;
}

const MyGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memberGroups, setMemberGroups] = useState<GroupMembership[]>([]);
  const [adminGroups, setAdminGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserGroups();
  }, []);

  const loadUserGroups = async () => {
    try {
      setLoading(true);
      const { memberGroups: memberData, adminGroups: adminData } = await getUserGroups();
      setMemberGroups(memberData);
      setAdminGroups(adminData);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus grupos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active_with_slots':
        return 'bg-green-100 text-green-800';
      case 'waiting_subscription':
        return 'bg-yellow-100 text-yellow-800';
      case 'queue':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'active_with_slots': 'Ativo',
      'waiting_subscription': 'Aguardando',
      'queue': 'Na Fila'
    };
    return labels[status] || status;
  };

  const getRelationshipLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'family': 'Família',
      'friends': 'Amigos',
      'work': 'Trabalho',
      'other': 'Outros'
    };
    return labels[type] || type;
  };

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Carregando...</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
        </div>
    );
  }

  const MemberGroupCard = ({ membership }: { membership: GroupMembership }) => {
    const group = membership.groups;
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {group.services?.icon_url && (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={group.services.icon_url} 
                    alt={group.services.name}
                    className="w-8 h-8"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                        </div>
              )}
                        <div>
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <CardDescription>{group.services?.name}</CardDescription>
                        </div>
                      </div>
            <Badge className={getStatusColor(group.status)}>
              {getStatusLabel(group.status)}
                      </Badge>
                    </div>
        </CardHeader>
        <CardContent>
                    <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Membros:</span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {group.current_members}/{group.max_members}
                        </span>
                      </div>
                      
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Valor pago:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(membership.paid_amount_cents)}
              </span>
                      </div>
                      
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Entrou em:</span>
              <span>{formatDate(membership.joined_at)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tipo:</span>
              <span>{getRelationshipLabel(group.relationship_type)}</span>
            </div>
            
            {group.description && (
              <p className="text-sm text-gray-600 mt-2">{group.description}</p>
            )}
            
            <Button
              onClick={() => navigate(`/group/${group.id}`)}
              variant="outline"
              size="sm"
              className="w-full mt-3"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </div>
                    </CardContent>
                  </Card>
                );
  };

  const AdminGroupCard = ({ group }: { group: Group }) => (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {group.services?.icon_url && (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <img 
                  src={group.services.icon_url} 
                  alt={group.services.name}
                  className="w-8 h-8"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {group.name}
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardTitle>
              <CardDescription>{group.services?.name}</CardDescription>
            </div>
            </div>
          <Badge className={getStatusColor(group.status)}>
            {getStatusLabel(group.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Membros:</span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {group.current_members}/{group.max_members}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Preço por vaga:</span>
            <span className="flex items-center gap-1 font-medium">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(group.price_per_slot_cents)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Criado em:</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(group.created_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tipo:</span>
            <span>{getRelationshipLabel(group.relationship_type)}</span>
          </div>
          
          {group.description && (
            <p className="text-sm text-gray-600 mt-2">{group.description}</p>
          )}
          
          <div className="flex gap-2 mt-3">
            <Button
              onClick={() => navigate(`/group/${group.id}`)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            <Button 
              onClick={() => navigate(`/grupo/${group.id}/gerenciar`)}
              size="sm"
              className="flex-1"
            >
              <Crown className="h-4 w-4 mr-2" />
              Gerenciar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Meus Grupos</h1>
          </div>
          <Button onClick={() => navigate('/criar-grupo')}>
            Criar Novo Grupo
          </Button>
        </div>

        <Tabs defaultValue="member" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="member" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participando ({memberGroups.length})
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Administrando ({adminGroups.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="member" className="space-y-4">
            {memberGroups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
                  <p className="text-gray-600 mb-4">
                    Você ainda não participa de nenhum grupo
                  </p>
                  <Button onClick={() => navigate('/grupos')}>
                    Explorar Grupos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memberGroups.map((membership) => (
                  <MemberGroupCard key={membership.id} membership={membership} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            {adminGroups.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Crown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum grupo criado</h3>
                  <p className="text-gray-600 mb-4">
                    Você ainda não criou nenhum grupo
                  </p>
                  <Button onClick={() => navigate('/criar-grupo')}>
                    Criar Primeiro Grupo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminGroups.map((group) => (
                  <AdminGroupCard key={group.id} group={group} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    <Footer />
  </>
  );
};

export default MyGroups; 