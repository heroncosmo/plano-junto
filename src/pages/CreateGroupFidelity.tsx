import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface GroupInfo {
  name: string;
  description: string;
  rules: string;
  relationshipType: string;
  site: string;
  pricePerSlot: number;
}

const CreateGroupFidelity = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, plan, groupInfo } = location.state || {};

  const [selectedFidelity, setSelectedFidelity] = useState<string>('sem');

  const fidelityOptions = [
    {
      id: 'sem',
      title: 'Sem',
      months: null,
      selected: true
    },
    {
      id: '6',
      title: '6',
      months: 6,
      selected: false
    },
    {
      id: '9',
      title: '9',
      months: 9,
      selected: false
    },
    {
      id: '12',
      title: '12',
      months: 12,
      selected: false
    }
  ];

  const handleFidelitySelect = (fidelityId: string) => {
    setSelectedFidelity(fidelityId);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    const selectedOption = fidelityOptions.find(opt => opt.id === selectedFidelity);
    
    navigate('/create-group/confirmation', {
      state: {
        service,
        plan,
        groupInfo,
        fidelity: {
          id: selectedFidelity,
          months: selectedOption?.months || null
        }
      }
    });
  };

  if (!service || !plan || !groupInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Informações não encontradas</p>
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Fidelidade</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Agora o seu grupo pode ter fidelidade!
          </p>
        </div>

        {/* Fidelity Info */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <p className="text-sm text-blue-800">
              <strong>Grupos com fidelidade</strong> oferecem uma experiência exclusiva e vantajosa para os 
              participantes do Kotas. Nessa modalidade, os administradores assinam um comprometimento de 
              manter o grupo ativo, enquanto os membros concordam em permanecer no grupo por um 
              período determinado.
            </p>
            <p className="text-sm text-blue-700 mt-3">
              Para entender todos os detalhes sobre grupos com fidelidade, <button className="underline">clique aqui</button>.
            </p>
          </CardContent>
        </Card>

        {/* Fidelity Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Fidelidade</h3>
          <p className="text-sm text-muted-foreground mb-6">Tempo em meses:</p>
          
          <div className="flex gap-4 justify-center">
            {fidelityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFidelitySelect(option.id)}
                className={`w-16 h-16 rounded-full border-2 text-lg font-semibold transition-colors ${
                  selectedFidelity === option.id 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white border-gray-300 hover:border-primary'
                }`}
              >
                {option.title}
              </button>
            ))}
          </div>
        </div>

        {/* Rules Section */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h4 className="font-semibold mb-3 text-blue-900">Regras básicas</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Os valores são recebidos mensalmente, até um <strong>compromisso mútuo de manter o grupo pelo período determinado.</strong></li>
              <li>• A ativação da fidelidade, o grupo só pode ser <strong>cancelado</strong> até o término da fidelidade, respeitando o cronograma de baixas e multas.</li>
              <li>• A reiniciação da fidelidade: acesso restringe automaticamente ao final do período estabelecido. Ele acontecerá para todos os membros no mesmo data de renovação do grupo.</li>
              <li>• Quebra de contrato: quem é membro permanente nos grupo por todo o período da fidelidade, mão se compromete a formar medidas administrativas para impedir essa companização, como restrição de produtos e acesso o grupo e as multas.</li>
            </ul>
            <p className="text-sm text-blue-700 mt-4">
              Consulte os Termos de Uso para Grupos com Fidelidade, <button className="underline">clicando aqui!</button>
            </p>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="w-full max-w-md"
          >
            Próximo
          </Button>
          
          <Button 
            variant="ghost"
            onClick={handleBack}
            className="w-full max-w-md mt-4"
          >
            Voltar
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateGroupFidelity;