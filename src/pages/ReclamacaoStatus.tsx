import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ReclamacaoStatus: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');

  const steps = [
    {
      id: 1,
      title: 'Reclamação registrada e repasse do administrador bloqueado até solução',
      status: 'completed',
      icon: Check
    },
    {
      id: 2,
      title: 'Administrador notificado para responder a reclamação',
      status: 'completed',
      icon: Check
    },
    {
      id: 3,
      title: 'Se você e o administrador não puderem chegar a um acordo, a JuntaPlay vai intervir e ajudar até 11/08/2025',
      status: 'current',
      icon: Clock
    },
    {
      id: 4,
      title: 'Reclamação finalizada',
      status: 'pending',
      icon: AlertCircle
    }
  ];

  const handleBackToSite = () => {
    if (groupId) {
      navigate(`/group/${groupId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleMoreAboutComplaints = () => {
    navigate('/ajuda');
  };

  const getStepIcon = (step: any) => {
    const IconComponent = step.icon;
    const iconClasses = {
      completed: 'w-6 h-6 text-white bg-cyan-500',
      current: 'w-6 h-6 text-white bg-orange-500',
      pending: 'w-6 h-6 text-gray-400 bg-gray-200'
    };
    
    return (
      <div className={`rounded-full flex items-center justify-center ${iconClasses[step.status]}`}>
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Header verde com checkmark */}
              <div className="bg-green-500 text-white rounded-t-lg -mt-8 -mx-8 p-8 mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-center">
                    Sua reclamação foi registrada
                  </h1>
                </div>
              </div>

              {/* Texto explicativo */}
              <p className="text-sm text-gray-600 mb-8 text-center">
                Enviamos uma mensagem ao administrador. Veja o que acontece em seguida:
              </p>

              {/* Timeline de progresso */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Reclamação em andamento
                </h2>
                
                <div className="relative">
                  {/* Linha vertical */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Steps */}
                  <div className="space-y-6">
                    {steps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-4">
                        {getStepIcon(step)}
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {step.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="space-y-3">
                <Button 
                  onClick={handleBackToSite}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Voltar ao site
                </Button>
                
                <button
                  onClick={handleMoreAboutComplaints}
                  className="w-full text-cyan-600 hover:text-cyan-700 text-sm flex items-center justify-center"
                >
                  Saiba mais sobre reclamações
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

export default ReclamacaoStatus; 