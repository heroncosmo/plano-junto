import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, Search, Filter, Star, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { useGroups, formatPrice, formatCategory } from "@/hooks/useGroups";

const AllGroups = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { groups, loading, error } = useGroups();

  // Capturar parâmetro de busca da URL
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  const getGroupImage = (category: string) => {
    const imageMap: Record<string, string> = {
      'ai_tools': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      'streaming': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400',
      'gaming': 'https://images.unsplash.com/photo-1606318664588-f04fcec5f817?w=400',
      'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      'education': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
      'productivity': 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400'
    };
    return imageMap[category] || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400';
  };

  // Filtrar grupos baseado na busca e categoria
  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           group.service.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || group.service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [groups, searchTerm, selectedCategory]);

  const categories = [
    { value: "all", label: "Todas as categorias" },
    { value: "ai_tools", label: "IA & Produtividade" },
    { value: "streaming", label: "Streaming" },
    { value: "gaming", label: "Jogos" },
    { value: "design", label: "Design & Criatividade" },
    { value: "education", label: "Educação" },
    { value: "productivity", label: "Software" }
  ];

  const handleGroupClick = (groupId: string) => {
    navigate(`/group/${groupId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando grupos...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header da página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Todos os grupos'}
          </h1>
          <p className="text-gray-600">
            {searchTerm 
              ? `${filteredGroups.length} grupos encontrados` 
              : 'Descubra grupos incríveis para economizar em suas assinaturas favoritas'
            }
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar grupos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid de grupos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGroups.map((group) => {
            const availableSpots = group.max_members - group.current_members;
            const isUrgent = availableSpots <= 1;
            const isFull = availableSpots === 0;
            const totalPrice = group.price_per_slot_cents * group.max_members;
            
            return (
              <Card 
                key={group.id} 
                className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleGroupClick(group.id)}
              >
                
                <CardContent className="p-6 text-center space-y-3">
                  {/* Avatar com inicial */}
                  <div className="w-16 h-16 mx-auto bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {group.service.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Nome do serviço */}
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {group.service.name}
                  </h3>
                  
                  
                  
                  {/* Número de vagas */}
                  <p className="text-sm text-gray-600 font-medium">
                    {group.max_members} Vagas
                  </p>
                  
                  {/* Preço */}
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(group.price_per_slot_cents)}
                  </p>
                  
                                          {/* Status */}
                                                 <p className="text-xs text-gray-500">
                           {availableSpots > 0 ? 'Assinado, aguardando vendas' : 'Assinado, aguardando membros'}
                         </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum grupo encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou buscar por outros termos</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Não encontrou o que procurava?</h2>
            <p className="text-lg opacity-90">
              Crie seu próprio grupo e convide outras pessoas para economizar juntas!
            </p>
            <Button size="lg" variant="secondary">
              Criar novo grupo
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AllGroups;