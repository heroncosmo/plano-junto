import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, Info } from 'lucide-react';

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

interface GroupInfo {
  name: string;
  description: string;
  rules: string;
  relationshipType: string;
  site: string;
  pricePerSlot: number;
}

const CreateGroupInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, plan } = location.state || {};

  const [groupInfo, setGroupInfo] = useState<GroupInfo>({
    name: plan ? `${plan.name} de Oriene` : '',
    description: 'Ação Descrição',
    rules: '',
    relationshipType: plan?.relationshipType || 'família',
    site: 'https://www.youtube.com/premium',
    pricePerSlot: plan?.pricePerUser || 0
  });

  const formatPrice = (priceCents: number) => {
    return `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
  };

  const handleInputChange = (field: keyof GroupInfo, value: string | number) => {
    setGroupInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate('/create-group/fidelity', {
      state: {
        service,
        plan,
        groupInfo
      }
    });
  };

  if (!service || !plan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Informações do serviço não encontradas</p>
            <Button onClick={() => navigate('/create-group')} className="mt-4">
              Voltar ao início
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
          <h1 className="text-3xl font-bold mb-2">Veja o resumo do seu grupo</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Serviço: {service.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Nome do grupo</Label>
                  <Input
                    id="groupName"
                    value={groupInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Digite o nome do grupo"
                  />
                </div>

                <div>
                  <Label htmlFor="relationship">Regras: Não compartilhe a senha e...</Label>
                  <Select 
                    value={groupInfo.relationshipType} 
                    onValueChange={(value) => handleInputChange('relationshipType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="família">Família</SelectItem>
                      <SelectItem value="amigos">Amigos</SelectItem>
                      <SelectItem value="trabalho">Trabalho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={groupInfo.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva o grupo..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="site">Site</Label>
                  <Input
                    id="site"
                    value={groupInfo.site}
                    onChange={(e) => handleInputChange('site', e.target.value)}
                    placeholder="URL do serviço"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fidelidade:</span>
                    <span className="font-medium">Sem fidelidade</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo em meses:</span>
                    <span className="font-medium">-</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor do serviço:</span>
                    <span className="font-medium">{formatPrice(plan.priceTotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor do serviço:</span>
                    <span className="font-medium">{formatPrice(plan.priceTotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor promocional:</span>
                    <span className="font-medium">Não</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vagas Totais:</span>
                    <span className="font-medium">{plan.maxUsers}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reservada para você:</span>
                    <span className="font-medium">1</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Os membros irão pagar: <strong>{formatPrice(groupInfo.pricePerSlot)}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Suporte aos membros:</h4>
                  <p className="text-sm text-muted-foreground">E-mail e WhatsApp</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Envio de acesso:</h4>
                  <p className="text-sm text-muted-foreground">+2dias o grupo completo</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Forma de acesso:</h4>
                  <p className="text-sm text-muted-foreground">Convite</p>
                </div>

                <div className="pt-4">
                  <label className="flex items-start space-x-2 text-sm">
                    <input type="checkbox" className="mt-0.5" />
                    <span className="text-muted-foreground">
                      Confirmo estar ciente de que a assinatura deve ser feita ao entrar ao
                      YouTube Premium. Contato que encontra assinatura será excluído do serviço 
                      YouTube Premium e não há qualquer devolução feitas.
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={handleContinue}
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

export default CreateGroupInfo;