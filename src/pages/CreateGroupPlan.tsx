import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string;
  max_users: number;
}

interface PlanOption {
  id: string;
  name: string;
  description: string;
  maxUsers: number;
  priceTotal: number;
  pricePerUser: number;
  relationshipType: string;
}

const CreateGroupPlan = () => {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const service = location.state?.service as Service;

  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);

  // Planos baseados no serviço selecionado
  const getPlansForService = (service: Service): PlanOption[] => {
    switch (service.name) {
      case 'YouTube Premium':
        return [
          {
            id: 'youtube-family',
            name: 'YouTube Premium Família',
            description: 'Plano familiar para YouTube Premium com acesso completo sem anúncios',
            maxUsers: 6,
            priceTotal: 4790, // R$ 47,90
            pricePerUser: 799, // R$ 7,99
            relationshipType: 'família'
          }
        ];
      case 'Netflix':
        return [
          {
            id: 'netflix-premium',
            name: 'Netflix Premium',
            description: 'Plano Premium Netflix para família',
            maxUsers: 4,
            priceTotal: 5000, // R$ 50,00
            pricePerUser: 1250, // R$ 12,50
            relationshipType: 'família'
          }
        ];
      case 'Spotify Premium':
        return [
          {
            id: 'spotify-family',
            name: 'Spotify Premium Família',
            description: 'Compartilhamento entre amigos para Spotify Premium Família',
            maxUsers: 6,
            priceTotal: 4140, // R$ 41,40
            pricePerUser: 690, // R$ 6,90
            relationshipType: 'família'
          }
        ];
      default:
        return [
          {
            id: 'default-plan',
            name: `${service.name} Compartilhado`,
            description: `Compartilhamento de ${service.name}`,
            maxUsers: service.max_users,
            priceTotal: 3000,
            pricePerUser: Math.floor(3000 / service.max_users),
            relationshipType: 'família'
          }
        ];
    }
  };

  const plans = service ? getPlansForService(service) : [];

  const formatPrice = (priceCents: number) => {
    return `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
  };

  const handlePlanSelect = (plan: PlanOption) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (!selectedPlan || !service) return;
    
    navigate('/create-group/info', {
      state: {
        service,
        plan: selectedPlan
      }
    });
  };

  const handleBack = () => {
    navigate('/create-group');
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Serviço não encontrado</p>
            <Button onClick={() => navigate('/create-group')} className="mt-4">
              Voltar
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6 p-0 h-auto text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Escolha um dos planos disponíveis para {service.name}
          </h1>
          <p className="text-muted-foreground">
            Selecione o plano que melhor se adequa às suas necessidades
          </p>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan?.id === plan.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <Badge variant="secondary">
                        {plan.relationshipType}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Membros</p>
                        <p className="font-semibold">{plan.maxUsers}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor do serviço</p>
                        <p className="font-semibold">{formatPrice(plan.priceTotal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor promocional</p>
                        <p className="text-sm text-muted-foreground">Não</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <p className="text-sm text-muted-foreground">Vagas Totais</p>
                    <p className="text-2xl font-bold">{plan.maxUsers}</p>
                    <p className="text-sm text-muted-foreground">1 vaga restante</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={handleContinue}
            disabled={!selectedPlan}
            size="lg"
            className="w-full max-w-md"
          >
            Voltar
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateGroupPlan;