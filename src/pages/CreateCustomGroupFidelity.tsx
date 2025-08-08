import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateCustomGroupFidelity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state || {};
  const [selectedFidelity, setSelectedFidelity] = useState('sem');

  const fidelityOptions = [
    { id: 'sem', label: 'Sem', months: null },
    { id: '6', label: '6', months: 6 },
    { id: '9', label: '9', months: 9 },
    { id: '12', label: '12', months: 12 }
  ];

  const handleBack = () => {
    navigate('/create-group/custom/values');
  };

  const handleContinue = () => {
    navigate('/create-group/custom/info', {
      state: { 
        formData,
        fidelity: selectedFidelity
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-medium text-gray-800">Fidelidade</h1>
            <p className="text-sm text-gray-600">Algum o seu grupo pode ter fidelidade?</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <Card className="bg-white border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                <span className="font-medium">Grupos com Fidelidade</span> oferecem uma experiência exclusiva e vantagens para os 
                membros. Os Kotas Nesta modalidade, os administradores oferecem o compromisso de 
                manter o grupo ativo enquanto os membros concordam em permanecer no grupo por um 
                período determinado.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Para entender todos os detalhes sobre grupos com fidelidade, <a href="#" className="text-cyan-500 underline">clique aqui</a>.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Fidelidade</h3>
              <p className="text-sm text-gray-600 mb-4">Tempo em meses:</p>
              
              <div className="flex space-x-3">
                {fidelityOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFidelity(option.id)}
                    className={`w-12 h-12 rounded-full border text-sm font-medium transition-colors ${
                      selectedFidelity === option.id
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Regras básicas</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Só pode desistir do grupo mediante um compromisso de manter o grupo pelo período de fidelidade</li>
                <li>• Só pode desistir do grupo mediante um compromisso de manter o grupo pelo período de fidelidade</li>
                <li>• Só pode desistir do grupo mediante um compromisso de manter o grupo pelo período de fidelidade, explicando o motivo de saída e multa</li>
                <li>• Os membros da fidelidade podem cancelar automaticamente no final do período contratado. Eles recebem para todos os membros na mesma data de renovação do grupo.</li>
              </ul>
              <p className="text-sm text-blue-700 mt-3">
                Consulte os Termos de Uso para Grupos com Fidelidade, <a href="#" className="underline">clicando aqui</a>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="mt-8">
          <Button 
            onClick={handleContinue}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            size="lg"
          >
            Próximo
          </Button>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <button 
            onClick={handleBack}
            className="text-cyan-500 text-sm underline"
          >
            Voltar
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateCustomGroupFidelity;
