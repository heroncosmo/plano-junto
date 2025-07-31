import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Users, Clock, Zap } from "lucide-react";

interface GroupCardProps {
  id: string;
  serviceName: string;
  groupName: string;
  description: string;
  pricePerSlot: number;
  currentMembers: number;
  maxMembers: number;
  status: 'waiting_subscription' | 'queue' | 'active_with_slots';
  instantAccess: boolean;
  relationshipType: string;
}

const getStatusConfig = (status: string, instantAccess: boolean) => {
  if (instantAccess) {
    return {
      badge: "Acesso Imediato",
      variant: "default" as const,
      icon: <Zap className="h-3 w-3" />
    };
  }
  
  switch (status) {
    case 'waiting_subscription':
      return {
        badge: "Aguardando Assinatura",
        variant: "secondary" as const,
        icon: <Clock className="h-3 w-3" />
      };
    case 'queue':
      return {
        badge: "Fila de Espera",
        variant: "outline" as const,
        icon: <Clock className="h-3 w-3" />
      };
    case 'active_with_slots':
      return {
        badge: "Vagas Disponíveis",
        variant: "default" as const,
        icon: <Users className="h-3 w-3" />
      };
    default:
      return {
        badge: "Disponível",
        variant: "secondary" as const,
        icon: <Users className="h-3 w-3" />
      };
  }
};

const GroupCard = ({
  serviceName,
  groupName,
  description,
  pricePerSlot,
  currentMembers,
  maxMembers,
  status,
  instantAccess,
  relationshipType
}: GroupCardProps) => {
  const statusConfig = getStatusConfig(status, instantAccess);
  const slotsLeft = maxMembers - currentMembers;
  const isAlmostFull = slotsLeft <= 2;

  return (
    <Card className="hover:shadow-primary transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{serviceName}</h3>
            <p className="text-sm text-muted-foreground">{groupName}</p>
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

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Membros:</span>
            <span className="font-medium">
              {currentMembers}/{maxMembers} 
              {isAlmostFull && (
                <span className="text-primary ml-1">• Últimas vagas!</span>
              )}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tipo:</span>
            <span className="font-medium capitalize">{relationshipType}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">
                R$ {(pricePerSlot / 100).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">por mês + taxa</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {slotsLeft} vaga{slotsLeft !== 1 ? 's' : ''} restante{slotsLeft !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full shadow-button" 
          variant={instantAccess ? "default" : "outline"}
        >
          {instantAccess ? "Entrar Agora" : "Entrar na Fila"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GroupCard;