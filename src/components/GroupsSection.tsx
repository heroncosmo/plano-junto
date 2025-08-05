import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import GroupCard from "./GroupCard";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import { usePublicGroups, PublicGroup } from "@/hooks/usePublicGroups";
import { useNavigate } from "react-router-dom";

const GroupsSection = () => {
  const navigate = useNavigate();
  const { groups, loading, error } = usePublicGroups();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [filteredGroups, setFilteredGroups] = useState<PublicGroup[]>([]);

  // Extrair serviços únicos dos grupos
  const services = ["Todos", ...Array.from(new Set(groups.map(group => group.services?.name).filter(Boolean)))];

  // Filtrar e ordenar grupos
  useEffect(() => {
    let filtered = groups;

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (group.services?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por serviço
    if (selectedService !== "Todos") {
      filtered = filtered.filter(group => group.services?.name === selectedService);
    }

    // Filtro por status
    if (selectedStatus !== "Todos") {
      if (selectedStatus === "Disponível") {
        filtered = filtered.filter(group => group.status === "active_with_slots");
      } else if (selectedStatus === "Aguardando") {
        filtered = filtered.filter(group => group.status === "waiting_subscription");
      }
    }

    // Ordenar: grupos com vagas primeiro, depois por data de criação
    const sorted = filtered.sort((a, b) => {
      const aSlotsLeft = a.max_members - a.current_members;
      const bSlotsLeft = b.max_members - b.current_members;
      
      if (aSlotsLeft === 0 && bSlotsLeft > 0) return 1;
      if (bSlotsLeft === 0 && aSlotsLeft > 0) return -1;
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredGroups(sorted);
  }, [groups, searchTerm, selectedService, selectedStatus]);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Grupos Disponíveis</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre grupos para dividir suas assinaturas favoritas. 
            Grupos com acesso imediato aparecem primeiro!
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por serviço ou nome do grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os status</SelectItem>
                <SelectItem value="Acesso Imediato">Acesso Imediato</SelectItem>
                <SelectItem value="Disponível">Vagas Disponíveis</SelectItem>
                <SelectItem value="Aguardando">Aguardando</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-cyan-600 hover:text-white"
              onClick={() => setSelectedStatus("Acesso Imediato")}
            >
              <Filter className="h-3 w-3 mr-1" />
              Acesso Imediato
            </Badge>
            <Badge 
              variant="outline"
              className="cursor-pointer hover:bg-cyan-600 hover:text-white" 
              onClick={() => setSelectedStatus("Disponível")}
            >
              Últimas Vagas
            </Badge>
          </div>

          {/* Create group CTA */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Não encontrou o que procura?</h3>
                <p className="text-sm text-muted-foreground">
                  Crie seu próprio grupo e convide outras pessoas para dividir os custos
                </p>
              </div>
              <Button 
                variant="outline" 
                className="shrink-0"
                onClick={() => navigate('/create-group')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Grupo
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando grupos...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Groups Grid */}
        {!loading && !error && filteredGroups.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.slice(0, 6).map(group => (
                <GroupCard 
                  key={group.id}
                  id={group.id}
                  serviceName={group.services?.name || 'Serviço'}
                  groupName={group.name}
                  description={group.description}
                  pricePerSlot={group.price_per_slot_cents}
                  currentMembers={group.current_members}
                  maxMembers={group.max_members}
                  status={group.status}
                  instantAccess={group.status === "active_with_slots"}
                  relationshipType={group.relationship_type}
                />
              ))}
            </div>
            
            {/* Mostrar total de grupos quando há mais de 6 */}
            {filteredGroups.length > 6 && (
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando 6 de {filteredGroups.length} grupos
                </p>
              </div>
            )}
          </>
        ) : !loading && !error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum grupo encontrado com os filtros selecionados.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchTerm("");
              setSelectedService("Todos");
              setSelectedStatus("Todos");
            }}>
              Limpar Filtros
            </Button>
          </div>
        ) : null}

        {/* Load more */}
        {!loading && !error && filteredGroups.length > 6 && (
          <div className="text-center mt-8">
            <Button 
              variant="outline"
              onClick={() => navigate('/groups')}
            >
              Ver todos os grupos
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default GroupsSection;