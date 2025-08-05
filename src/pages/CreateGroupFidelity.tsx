import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const CreateGroupFidelity = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, plan, groupInfo } = location.state || {};

  const [selectedFidelity, setSelectedFidelity] = useState<string>('sem');

  const fidelityOptions = [
    { id: 'sem', title: 'Sem', months: null },
    { id: '6', title: '6', months: 6 },
    { id: '9', title: '9', months: 9 },
    { id: '12', title: '12', months: 12 }
  ];

  const handleFidelitySelect = (fidelityId: string) => {
    setSelectedFidelity(fidelityId);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    const selectedOption = fidelityOptions.find(opt => opt.id === selectedFidelity);
    
    navigate('/create-group/info', {
      state: {
        service,
        plan,
        fidelity: {
          id: selectedFidelity,
          months: selectedOption?.months || null
        }
      }
    });
  };

  if (!service || !plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Informações não encontradas</p>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-3 p-0 h-auto text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-1 text-gray-900">Fidelidade</h1>
          <p className="text-gray-600 text-xs">
            Agora o seu grupo pode ter fidelidade!
          </p>
        </div>

        {/* Information Box */}
        <Card className="mb-4 bg-white border-gray-200">
          <CardContent className="p-3">
            <p className="text-gray-700 text-xs mb-2">
              Grupos com Fidelidade oferecem uma experiência exclusiva e vantajosa para os participantes do Kotas. 
              Nessa modalidade, os administradores assumem o compromisso de manter o grupo ativo, enquanto os membros 
              concordam em permanecer no grupo por um período determinado.
            </p>
            <p className="text-gray-600 text-xs">
              Para entender todos os detalhes sobre grupos com fidelidade, 
              <button className="text-cyan-600 underline ml-1">clique aqui</button>.
            </p>
          </CardContent>
        </Card>

        {/* Fidelity Selection */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-1 text-gray-900">Fidelidade</h3>
          <p className="text-xs text-gray-600 mb-2">Tempo em meses:</p>
          
          <div className="flex gap-2 justify-center">
            {fidelityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFidelitySelect(option.id)}
                className={`w-10 h-10 rounded-full border-2 text-xs font-semibold transition-all duration-200 ${
                  selectedFidelity === option.id 
                    ? 'bg-cyan-100 text-cyan-700 border-cyan-300' 
                    : 'bg-white border-gray-300 text-gray-600 hover:border-cyan-300 hover:bg-cyan-50'
                }`}
              >
                {option.title}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Rules Box */}
        <Card className="mb-4 bg-cyan-50 border-cyan-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2 mb-2">
                              <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="h-2.5 w-2.5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-cyan-900 mb-1 text-xs">Regras básicas</h4>
                <ul className="space-y-1 text-xs text-cyan-800">
                  <li>
                    Os participantes do grupo assumem um <strong>compromisso mútuo</strong> de manter o grupo pelo período determinado;
                  </li>
                  <li>
                    Durante o período estabelecido, o grupo não pode ser <strong>cancelado</strong> até o término da fidelidade, sujeito a pagamento de taxas e multas;
                  </li>
                  <li>
                    A <strong>renovação de fidelidade</strong> acontece automaticamente no final do período estabelecido. Ela acontece para todos os membros na mesma data de renovação do grupo.
                  </li>
                  <li>
                    O Kotas não pode garantir que o membro permaneça no grupo por todo o período da fidelidade, mas se compromete a tomar medidas administrativas para impedir esse comportamento, como restrições de participação em grupos e multas.
                  </li>
                </ul>
                <p className="text-xs text-cyan-700 mt-2">
                  Consulte os Termos de Uso para Grupos com Fidelidade, 
                  <button className="underline ml-1">clicando aqui</button>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Button */}
        <div className="text-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="w-full max-w-md bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Continuar
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateGroupFidelity;