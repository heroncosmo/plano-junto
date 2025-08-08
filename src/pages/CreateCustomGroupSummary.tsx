import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, ChevronDown } from 'lucide-react';

const CreateCustomGroupSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, fidelity } = location.state || {};
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleBack = () => {
    navigate('/create-group/custom/questions2');
  };

  const handleCreateGroup = () => {
    if (!agreedToTerms) {
      alert('Você precisa concordar com os termos para continuar');
      return;
    }
    
    // Simular criação do grupo
    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/create-group');
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
            <h1 className="text-lg font-medium text-gray-800">Veja o resumo do seu grupo</h1>
          </div>
        </div>

        <div className="space-y-4">
          {/* Serviço */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Serviço: E-g</h3>
                  <p className="text-sm text-gray-600">Nome do grupo: E-g</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600">Regras: Não compartilhe a senha c...</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-600">Descrição: E-g...</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Site: E-g</p>
                </div>
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fidelidade */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Fidelidade: Sem fidelidade</h3>
                </div>
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valor do serviço */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Valor do serviço: R$ 10,00</h3>
                </div>
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valor do serviço (duplicado) */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-800">Valor do serviço: R$ 10,00</h3>
                </div>
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">?</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valor promocional */}
          <div className="text-sm text-gray-600">
            Valor promocional: Não
          </div>

          {/* Vagas Totais */}
          <div className="text-sm text-gray-600">
            Vagas Totais: -
          </div>

          {/* Reservadas para você */}
          <div className="text-sm text-gray-600">
            Reservadas para você: 1
          </div>

          {/* Os membros têm que pagar */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <p className="text-sm text-cyan-800">
              Os membros têm que pagar: <span className="font-medium">R$ 6,00</span>
              <button className="ml-2 text-cyan-600 underline text-xs">Reduzir valor</button>
            </p>
          </div>

          {/* Suporte aos membros */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Suporte aos membros: E-mail e WhatsApp</span>
            <Edit className="h-4 w-4 text-gray-400" />
          </div>

          {/* Envio de acesso */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Envio de acesso: Após o grupo completar</span>
            <Edit className="h-4 w-4 text-gray-400" />
          </div>

          {/* Forma de acesso */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">Forma de acesso: Login e Senha</span>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start space-x-2 py-4">
            <input 
              type="checkbox" 
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5" 
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              Confirmo estar ciente de que a plataforma <span className="font-medium">Kotas</span> não está associada ou afiliada ao 
              serviço que Concordo em cumprir integralmente os termos de serviço e as 
              plataforma <span className="font-medium">Kotas</span>.
            </label>
          </div>
        </div>

        {/* Create Group Button */}
        <div className="mt-8">
          <Button 
            onClick={handleCreateGroup}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            size="lg"
            disabled={!agreedToTerms}
          >
            Criar Grupo
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-cyan-500">😊</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Ops! :)</h3>
            <p className="text-sm text-gray-600 mb-6">
              Precisamos de mais informações sobre sua conta antes de 
              efetuar essa ação. Entre em contato com o suporte.
              <br />
              <a href="#" className="text-cyan-500 underline">Clique aqui</a> para ter assistência.
            </p>
            <Button 
              onClick={handleModalClose}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Ok
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CreateCustomGroupSummary;
