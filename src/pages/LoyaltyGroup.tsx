import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, FileText, Info } from 'lucide-react';

const LoyaltyGroup = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleProceed = () => {
    if (agreed) {
      navigate('/payment');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Card Principal - Clone Kotas */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          
          {/* Header com título e badge */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Grupo com Fidelidade</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white text-xs rounded-full">
              <AlertTriangle className="h-3 w-3" />
              <span>Atenção</span>
            </div>
          </div>

          {/* Card interno com ícone */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            
            {/* Ícone centralizado */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Texto introdutório */}
            <p className="text-center text-gray-700 mb-6 text-sm">
              Você está prestes a ingressar em um grupo que contém fidelidade.
            </p>

            {/* Parágrafo explicativo */}
            <p className="text-gray-700 leading-relaxed mb-6 text-sm">
              Grupos com Fidelidade oferecem uma experiência exclusiva e vantajosa para os participantes do Kotas. Nessa modalidade, os administradores assumem o compromisso de manter o grupo ativo, enquanto os membros concordam em permanecer no grupo por um período determinado. Para entender todos os detalhes sobre grupos com fidelidade,{' '}
              <a href="#" className="text-blue-600 underline font-medium">clique aqui</a>.
            </p>

            {/* Seção de regras básicas */}
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="h-5 w-5 text-blue-500" />
                <h2 className="font-semibold text-gray-900">Regras básicas</h2>
              </div>
              
              <ul className="space-y-3 text-gray-700 text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Os participantes do grupo assumem um <strong>compromisso mútuo</strong> de manter o grupo pelo período determinado;
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Durante o período estabelecido, sua inscrição <strong>não pode ser cancelada</strong> até o término da fidelidade, sujeito a pagamento de taxas e multas;
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    <strong>A renovação de fidelidade</strong> acontece automaticamente no final do período estabelecido. Ela acontece para todos os membros na mesma data de renovação do grupo.
                  </span>
                </li>
              </ul>
            </div>

            {/* Checkbox de confirmação */}
            <div className="flex items-start gap-3">
              <Checkbox 
                id="agreement" 
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="agreement" className="text-xs text-gray-700 leading-relaxed">
                Confirmo que li e estou de acordo com as regras e os{' '}
                <a href="#" className="text-blue-600 underline">Termos de Uso de Grupos com Fidelidade</a>. 
                Aceito permanecer no grupo pelo período mínimo de <strong>3 meses</strong> e estou ciente de que podem ser aplicadas taxas e multas em caso de cancelamento antecipado.
              </label>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              onClick={handleProceed}
              disabled={!agreed}
              className="w-full max-w-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prosseguir
            </Button>
            
            <button 
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-700 text-xs font-medium"
            >
              Voltar
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoyaltyGroup; 