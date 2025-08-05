import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, FileText, User, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ReclamacaoFAQ: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Qual a maneira mais rápida de resolver um problema no meu grupo?",
      answer: "Entre em contato diretamente com o administrador do grupo através dos contatos fornecidos. Na maioria dos casos, o administrador pode resolver o problema rapidamente sem necessidade de abrir uma reclamação formal."
    },
    {
      question: "Por quanto tempo minha assinatura está protegida?",
      answer: "Sua assinatura está protegida durante todo o período contratado. O JuntaPlay só repassa o pagamento ao administrador no final do período, garantindo que você tenha acesso ao serviço pelo tempo que pagou."
    },
    {
      question: "Em caso de problemas, posso pedir reembolso?",
      answer: "Sim, você pode solicitar reembolso através do sistema de reclamações. O reembolso será proporcional aos dias não utilizados do serviço, desde que a reclamação seja aprovada pela nossa equipe."
    },
    {
      question: "Quais são as situações de cobertura pelo programa de proteção?",
      answer: "O programa cobre problemas com serviços, pagamentos não autorizados e descumprimento de acordos. Isso inclui: serviços que param de funcionar, diferenças entre o que foi prometido e o que foi entregue, e cobranças indevidas."
    },
    {
      question: "Em quanto tempo tenho a solução para um problema?",
      answer: "O administrador tem 7 dias para responder sua reclamação. Após 14 dias, se não houver acordo entre as partes, a JuntaPlay intervém automaticamente para resolver a situação."
    }
  ];

  const handleNext = () => {
    if (groupId) {
      navigate(`/reclamacao/dados-grupo?groupId=${groupId}`);
    } else {
      navigate('/reclamacao/dados-grupo');
    }
  };

  const handleBack = () => {
    if (groupId) {
      navigate(`/reclamacao/inicial?groupId=${groupId}`);
    } else {
      navigate('/reclamacao/inicial');
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Título */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Perguntas frequentes
              </h1>

              {/* Ilustração */}
              <div className="mb-6 flex justify-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="w-16 h-20 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-8 h-8 text-cyan-600" />
                  </div>
                </div>
              </div>

              {/* Texto introdutório */}
              <p className="text-sm text-gray-600 mb-6 text-center">
                Abaixo estão as dúvidas mais frequentes sobre o funcionamento da reclamação. 
                Clique em uma pergunta para ver a resposta. Muitas vezes a solução está aqui mesmo!
              </p>

              {/* Lista de FAQs */}
              <div className="space-y-3 mb-8">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <span className="text-sm text-gray-700 flex-1 text-left">
                        {faq.question}
                      </span>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedFaq === index && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-cyan-600 font-medium">
                            💡 Esta resposta resolveu sua dúvida? Se não, continue para abrir uma reclamação.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Aviso sobre self-service */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">🎯 Tente resolver primeiro!</h3>
                <p className="text-sm text-green-700">
                  Muitos problemas podem ser resolvidos rapidamente entrando em contato direto com o administrador. 
                  Só abra uma reclamação se realmente não conseguir resolver de outra forma.
                </p>
              </div>

              {/* Botões de navegação */}
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handleNext}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Continuar para reclamação
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

export default ReclamacaoFAQ; 