import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Target } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ReclamacaoSolucaoDesejada: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [selectedSolution, setSelectedSolution] = useState<string>('');

  const solutionOptions = [
    {
      value: 'problem_solution',
      label: 'Solução do problema'
    },
    {
      value: 'problem_solution_and_refund',
      label: 'Solução do problema e reembolso dos dias até a solução'
    },
    {
      value: 'subscription_cancellation_and_refund',
      label: 'Cancelamento da sua assinatura e reembolso'
    }
  ];

  const handleNext = () => {
    if (selectedSolution) {
      // Salvar dados no localStorage
      if (groupId) {
        const savedData = localStorage.getItem(`complaint_data_${groupId}`) || '{}';
        const parsedData = JSON.parse(savedData);
        localStorage.setItem(`complaint_data_${groupId}`, JSON.stringify({
          ...parsedData,
          desiredSolution: selectedSolution
        }));
      }

      if (groupId) {
        const problemType = searchParams.get('problemType') || 'other';
        navigate(`/reclamacao/historico?groupId=${groupId}&problemType=${problemType}&desiredSolution=${selectedSolution}`);
      } else {
        navigate('/reclamacao/historico');
      }
    }
  };

  const handleBack = () => {
    if (groupId) {
      navigate(`/reclamacao/oque-aconteceu?groupId=${groupId}`);
    } else {
      navigate('/reclamacao/oque-aconteceu');
    }
  };

  const isNextDisabled = !selectedSolution;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Título */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Solução desejada
              </h1>

              {/* Ilustração */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
              </div>

              {/* Opções de solução */}
              <div className="mb-8">
                <RadioGroup
                  value={selectedSolution}
                  onValueChange={setSelectedSolution}
                  className="space-y-4"
                >
                  {solutionOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label
                        htmlFor={option.value}
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Botões de navegação */}
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`w-full ${
                    isNextDisabled 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  }`}
                >
                  Próximo
                </Button>
                
                <button
                  onClick={handleBack}
                  className="text-cyan-600 hover:text-cyan-700 text-sm flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReclamacaoSolucaoDesejada; 