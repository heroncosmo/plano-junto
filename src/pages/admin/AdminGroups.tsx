import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Eye, Check, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GroupData {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  admin_id: string;
  service_id: string;
  max_members: number;
  current_members: number;
  price_per_slot_cents: number;
  admin_profile?: {
    full_name: string;
    user_id: string;
  };
  services?: {
    name: string;
    icon_url: string;
  };
}

const AdminGroups = () => {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingGroup, setApprovingGroup] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);

      // Debug: verificar usuário atual
      const { data: userData } = await supabase.auth.getUser();
      console.log('🔍 DEBUG - Usuário atual:', userData.user?.email);

      // Buscar grupos básicos (apenas os que precisam de aprovação)
      const { data: groupsData, error } = await supabase
        .from('groups')
        .select('*')
        .eq('admin_approved', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer com dados relacionados
      if (groupsData && groupsData.length > 0) {
        const enrichedGroups = await Promise.all(
          groupsData.map(async (group) => {
            // Buscar dados do admin
            const { data: adminData } = await supabase
              .from('profiles')
              .select('full_name, user_id')
              .eq('user_id', group.admin_id)
              .single();

            // Buscar dados do serviço
            const { data: serviceData } = await supabase
              .from('services')
              .select('name, icon_url')
              .eq('id', group.service_id)
              .single();

            // Contar membros atuais
            const { count: memberCount } = await supabase
              .from('group_memberships')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id)
              .eq('status', 'active');

            return {
              ...group,
              admin_profile: adminData,
              services: serviceData,
              current_members: memberCount || 0
            };
          })
        );

        setGroups(enrichedGroups);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de grupos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveGroup = async (groupId: string) => {
    try {
      console.log('🔍 DEBUG - Iniciando aprovação do grupo:', groupId);
      setApprovingGroup(groupId);

      // Buscar informações do grupo para verificar se é personalizado
      const { data: groupData, error: fetchError } = await supabase
        .from('groups')
        .select(`
          *,
          services:service_id (
            pre_approved
          )
        `)
        .eq('id', groupId)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar dados do grupo:', fetchError);
        throw fetchError;
      }

      console.log('🔍 DEBUG - Dados do grupo:', groupData);

      // Para grupos personalizados (serviços não pré-aprovados), liberar automaticamente
      const isCustomGroup = !groupData.services?.pre_approved;
      console.log('🔍 DEBUG - É grupo personalizado?', isCustomGroup);

      const updateData = {
        admin_approved: true,
        owner_approved: isCustomGroup ? true : false, // Liberar automaticamente se for personalizado
        status: isCustomGroup ? 'active_with_slots' : 'waiting_subscription'
      };

      console.log('🔍 DEBUG - Dados para atualização:', updateData);

      const { error } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', groupId);

      if (error) {
        console.error('❌ Erro ao atualizar grupo:', error);
        throw error;
      }

      console.log('✅ Grupo aprovado com sucesso!');

      toast({
        title: "Grupo Aprovado",
        description: isCustomGroup
          ? "Grupo personalizado foi aprovado e está disponível para participação."
          : "Grupo foi aprovado pelo administrador e agora aguarda liberação do dono.",
      });

      await loadGroups();

    } catch (error) {
      console.error('❌ Erro ao aprovar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar grupo.",
        variant: "destructive",
      });
    } finally {
      setApprovingGroup(null);
    }
  };

  const handleRejectGroup = async (groupId: string) => {
    try {
      setApprovingGroup(groupId);

      const { error } = await supabase
        .from('groups')
        .update({
          admin_approved: false,
          status: 'rejected'
        })
        .eq('id', groupId);

      if (error) throw error;

      toast({
        title: "Grupo Rejeitado",
        description: "Grupo foi rejeitado pelo administrador.",
      });

      await loadGroups();

    } catch (error) {
      console.error('Erro ao rejeitar grupo:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar grupo.",
        variant: "destructive",
      });
    } finally {
      setApprovingGroup(null);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (group: GroupData) => {
    if (!group.admin_approved && group.status !== 'rejected') {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (group.admin_approved) {
      return 'bg-green-100 text-green-800';
    }
    if (group.status === 'rejected') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (group: GroupData) => {
    if (!group.admin_approved && group.status !== 'rejected') {
      return 'Aguardando Aprovação';
    }
    if (group.admin_approved) {
      return 'Aprovado pelo Admin';
    }
    if (group.status === 'rejected') {
      return 'Rejeitado';
    }
    return group.status;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p>Carregando grupos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aprovação de Grupos</h2>
        <p className="text-gray-600">
          Gerencie a aprovação de grupos criados pelos usuários
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Crown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
            <p className="text-gray-600">
              Não há grupos registrados no sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.id}>
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
                      <p className="text-sm text-gray-600">{group.services?.name}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(group)}>
                    {getStatusLabel(group)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Informações do Grupo</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Admin:</span>
                          <span className="font-medium">{group.admin_profile?.full_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Preço:</span>
                          <span className="font-medium">{formatCurrency(group.price_per_slot_cents)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Membros:</span>
                          <span className="font-medium">{group.current_members}/{group.max_members}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Criado em:</span>
                          <span className="font-medium">{formatDate(group.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Descrição</h4>
                      <p className="text-sm text-gray-700">
                        {group.description || 'Nenhuma descrição fornecida'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => navigate(`/group/${group.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Grupo
                    </Button>
                    
                    {!group.admin_approved && group.status !== 'rejected' && (
                      <>
                        <Button
                          onClick={() => handleApproveGroup(group.id)}
                          disabled={approvingGroup === group.id}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          {approvingGroup === group.id ? 'Processando...' : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => handleRejectGroup(group.id)}
                          disabled={approvingGroup === group.id}
                          size="sm"
                          className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                          {approvingGroup === group.id ? 'Processando...' : (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGroups; 