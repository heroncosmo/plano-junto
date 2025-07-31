import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import GroupCard from "./GroupCard";
import { Search, Filter, Plus } from "lucide-react";

// Mock data - replace with real data from Supabase
const mockGroups = [
  {
    id: "1",
    serviceName: "YouTube Premium",
    groupName: "Família YouTube Premium",
    description: "Grupo familiar para YouTube Premium com acesso completo sem anúncios",
    pricePerSlot: 799, // R$ 7,99 in cents
    currentMembers: 4,
    maxMembers: 6,
    status: "active_with_slots" as const,
    instantAccess: true,
    relationshipType: "família"
  },
  {
    id: "2",
    serviceName: "Spotify Premium",
    groupName: "Amigos Spotify",
    description: "Compartilhamento entre amigos para Spotify Premium Família",
    pricePerSlot: 690,
    currentMembers: 5,
    maxMembers: 6,
    status: "active_with_slots" as const,
    instantAccess: true,
    relationshipType: "amigos"
  },
  {
    id: "3",
    serviceName: "Netflix",
    groupName: "Netflix Família Silva",
    description: "Plano Premium Netflix para família",
    pricePerSlot: 1250,
    currentMembers: 3,
    maxMembers: 4,
    status: "active_with_slots" as const,
    instantAccess: false,
    relationshipType: "família"
  },
  {
    id: "4",
    serviceName: "ChatGPT Plus",
    groupName: "Grupo Profissional AI",
    description: "ChatGPT Plus para uso profissional",
    pricePerSlot: 2000,
    currentMembers: 1,
    maxMembers: 1,
    status: "waiting_subscription" as const,
    instantAccess: false,
    relationshipType: "trabalho"
  }
];

const services = [
  "Todos",
  "YouTube Premium",
  "Netflix", 
  "Spotify Premium",
  "Disney+",
  "Amazon Prime",
  "HBO Max",
  "ChatGPT Plus",
  "Udemy",
  "Canva Pro"
];

const GroupsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  const filteredGroups = mockGroups.filter(group => {
    const matchesSearch = group.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.groupName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === "Todos" || group.serviceName === selectedService;
    const matchesStatus = selectedStatus === "Todos" || 
                         (selectedStatus === "Acesso Imediato" && group.instantAccess) ||
                         (selectedStatus === "Aguardando" && group.status === "waiting_subscription") ||
                         (selectedStatus === "Disponível" && group.status === "active_with_slots");
    
    return matchesSearch && matchesService && matchesStatus;
  });

  // Sort groups: instant access first, then by available slots (fewer slots = higher priority)
  const sortedGroups = filteredGroups.sort((a, b) => {
    if (a.instantAccess && !b.instantAccess) return -1;
    if (!a.instantAccess && b.instantAccess) return 1;
    
    const aSlotsLeft = a.maxMembers - a.currentMembers;
    const bSlotsLeft = b.maxMembers - b.currentMembers;
    
    return aSlotsLeft - bSlotsLeft;
  });

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
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => setSelectedStatus("Acesso Imediato")}
            >
              <Filter className="h-3 w-3 mr-1" />
              Acesso Imediato
            </Badge>
            <Badge 
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground" 
              onClick={() => setSelectedStatus("Disponível")}
            >
              Últimas Vagas
            </Badge>
          </div>

          {/* Create group CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Não encontrou o que procura?</h3>
                <p className="text-sm text-muted-foreground">
                  Crie seu próprio grupo e convide outras pessoas para dividir os custos
                </p>
              </div>
              <Button variant="outline" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Criar Grupo
              </Button>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {sortedGroups.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGroups.map(group => (
              <GroupCard key={group.id} {...group} />
            ))}
          </div>
        ) : (
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
        )}

        {/* Load more */}
        {sortedGroups.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Carregar mais grupos
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default GroupsSection;