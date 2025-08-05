import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ReclamacaoInicial: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');

  const handleNext = () => {
    if (groupId) {
      navigate(`/reclamacao/perguntas-frequentes?groupId=${groupId}`);
    } else {
      navigate('/reclamacao/perguntas-frequentes');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              {/* Ilustração */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-2">
                    <User className="w-8 h-8 text-cyan-600" />
                  </div>
                  <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center absolute -bottom-2 -right-2">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Título */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Abrir reclamação
              </h1>

              {/* Texto explicativo */}
              <div className="space-y-3 mb-8">
                <p className="text-sm text-gray-600">
                  No JuntaPlay, seu dinheiro está sempre seguro
                </p>
                <p className="text-sm text-gray-600">
                  Nosso programa de proteção cuida dos seus pagamentos e só repassa ao administrador no final do período contratado
                </p>
              </div>

              {/* Botão Próximo */}
              <Button 
                onClick={handleNext}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                Próximo
              </Button>

              {/* Botão Voltar */}
              <button
                onClick={handleBack}
                className="mt-4 text-cyan-600 hover:text-cyan-700 text-sm flex items-center justify-center w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReclamacaoInicial; 