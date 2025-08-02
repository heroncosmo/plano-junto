import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Users, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAvailableGroups, fixAllUserGroups } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GroupDetailed {
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
    id: string;
    name: string;
    category: string;
    icon_url?: string;
  };
  admin_name?: string;
  availability_status?: string;
}

const AllGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.email === 'calcadosdrielle@gmail.com';
  const [grupos, setGrupos] = useState<GroupDetailed[]>([]);
  const [gruposFiltrados, setGruposFiltrados] = useState<GroupDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  useEffect(() => {
    loadAvailableGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [grupos, searchTerm, categoryFilter, relationshipFilter, priceFilter]);

  const loadAvailableGroups = async () => {
    try {
      setLoading(true);
      const groups = await getAvailableGroups();
      setGrupos(groups);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os grupos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = grupos;

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.services?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(group => group.services?.category === categoryFilter);
    }

    // Filtro por tipo de relacionamento
    if (relationshipFilter && relationshipFilter !== 'all') {
      filtered = filtered.filter(group => group.relationship_type === relationshipFilter);
    }

    // Filtro por faixa de preço
    if (priceFilter && priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number);
      filtered = filtered.filter(group => {
        const price = group.price_per_slot_cents;
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    setGruposFiltrados(filtered);
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

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'streaming': 'Streaming',
      'music': 'Música',
      'education': 'Educação',
      'ai': 'Inteligência Artificial',
      'gaming': 'Jogos',
      'productivity': 'Produtividade',
      'other': 'Outros',
      'unknown': 'Não especificado'
    };
    return labels[category] || category;
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

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'empty':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'available': 'Disponível',
      'full': 'Completo',
      'empty': 'Vazio'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }

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
            <h1 className="text-2xl font-bold">Todos os Grupos</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/create-group')}>
              Criar Grupo
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setGrupos([]);
                loadAvailableGroups();
              }}
            >
              Atualizar
            </Button>
            {isAdmin && (
              <Button 
                onClick={async () => {
                  try {
                    await fixAllUserGroups();
                    toast({
                      title: "Sucesso",
                      description: "Grupos corrigidos! Recarregue a página.",
                    });
                  } catch (error) {
                    toast({
                      title: "Erro",
                      description: "Erro ao corrigir grupos.",
                      variant: "destructive",
                    });
                  }
                }} 
                variant="secondary" 
                className="ml-2"
              >
                Corrigir Meus Grupos
              </Button>
            )}
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca por texto */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Nome do grupo ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Filtro por categoria */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    <SelectItem value="streaming">Streaming</SelectItem>
                    <SelectItem value="music">Música</SelectItem>
                    <SelectItem value="education">Educação</SelectItem>
                    <SelectItem value="ai">IA</SelectItem>
                    <SelectItem value="gaming">Jogos</SelectItem>
                    <SelectItem value="productivity">Produtividade</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por tipo de relacionamento */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="family">Família</SelectItem>
                    <SelectItem value="friends">Amigos</SelectItem>
                    <SelectItem value="work">Trabalho</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
            </div>

              {/* Filtro por preço */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Faixa de Preço</label>
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="Qualquer preço" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Qualquer preço</SelectItem>
                    <SelectItem value="0-1000">Até R$ 10,00</SelectItem>
                    <SelectItem value="1000-2000">R$ 10,00 - R$ 20,00</SelectItem>
                    <SelectItem value="2000-3000">R$ 20,00 - R$ 30,00</SelectItem>
                    <SelectItem value="3000-5000">R$ 30,00 - R$ 50,00</SelectItem>
                    <SelectItem value="5000">Acima de R$ 50,00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            {gruposFiltrados.length} grupo(s) encontrado(s)
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setRelationshipFilter('all');
              setPriceFilter('all');
            }}
          >
            Limpar Filtros
          </Button>
        </div>

        {gruposFiltrados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou criar um novo grupo
              </p>
              <Button onClick={() => navigate('/criar-grupo')}>
                Criar Novo Grupo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gruposFiltrados.map((grupo) => (
              <Card key={grupo.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {grupo.services?.icon_url && (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <img 
                            src={grupo.services.icon_url} 
                            alt={grupo.services.name}
                            className="w-8 h-8"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{grupo.name}</CardTitle>
                        <CardDescription>{grupo.services?.name || 'Serviço não disponível'}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getAvailabilityColor(grupo.current_members >= grupo.max_members ? 'full' : 'available')}>
                      {getAvailabilityLabel(grupo.current_members >= grupo.max_members ? 'full' : 'available')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Vagas:</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {grupo.current_members}/{grupo.max_members}
                      </span>
                  </div>
                  
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Preço por vaga:</span>
                      <span className="flex items-center gap-1 font-medium text-green-600">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(grupo.price_per_slot_cents)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Criado em:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(grupo.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {getCategoryLabel(grupo.services?.category || 'unknown')}
                      </Badge>
                      <Badge variant="outline">
                        {getRelationshipLabel(grupo.relationship_type)}
                      </Badge>
                    </div>
                    
                    {grupo.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {grupo.description}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      Admin: {grupo.admin_name}
                    </div>
                    
                    <Button
                      onClick={() => navigate(`/group/${grupo.id}`)}
                      className="w-full"
                      disabled={grupo.current_members >= grupo.max_members}
                    >
                      {grupo.current_members >= grupo.max_members ? (
                        'Grupo Completo'
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </div>
        </div>
      <Footer />
   </>
  );
};

export default AllGroups;