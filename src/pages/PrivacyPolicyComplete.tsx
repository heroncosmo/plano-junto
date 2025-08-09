import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PrivacyPolicyComplete: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Política de Privacidade - JuntaPlay
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Informações que Coletamos</h2>
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-800">1.1 Informações Pessoais</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Nome completo e email</li>
                  <li>Informações de pagamento (processadas por terceiros seguros)</li>
                  <li>Dados de comunicação e suporte</li>
                </ul>
                
                <h3 className="text-lg font-medium text-gray-800">1.2 Informações de Uso</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Dados de navegação e interação com a plataforma</li>
                  <li>Informações sobre grupos criados ou participados</li>
                  <li>Histórico de transações</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Como Usamos suas Informações</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pagamentos e transações</li>
                <li>Comunicar sobre sua conta e grupos</li>
                <li>Oferecer suporte ao cliente</li>
                <li>Cumprir obrigações legais</li>
                <li>Enviar comunicações de marketing (com seu consentimento)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Compartilhamento de Informações</h2>
              <p className="text-gray-700 mb-3">
                Não vendemos suas informações pessoais. Podemos compartilhar dados apenas nas seguintes situações:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Com outros membros do grupo (informações necessárias para o funcionamento)</li>
                <li>Com processadores de pagamento seguros</li>
                <li>Para cumprir obrigações legais</li>
                <li>Com seu consentimento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Segurança dos Dados</h2>
              <p className="text-gray-700">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações 
                contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Seus Direitos</h2>
              <p className="text-gray-700 mb-3">
                Conforme a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou incorretos</li>
                <li>Solicitar a exclusão de dados</li>
                <li>Revogar consentimento</li>
                <li>Portabilidade dos dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies e Tecnologias Similares</h2>
              <p className="text-gray-700">
                Utilizamos cookies para melhorar sua experiência, analisar o uso da plataforma e 
                personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas 
                configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Retenção de Dados</h2>
              <p className="text-gray-700">
                Mantemos suas informações pelo tempo necessário para fornecer nossos serviços 
                e cumprir obrigações legais. Dados de transações podem ser mantidos por períodos 
                mais longos conforme exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Alterações nesta Política</h2>
              <p className="text-gray-700">
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças 
                significativas através da plataforma ou por email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contato</h2>
              <p className="text-gray-700">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, 
                entre em contato conosco:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacidade@juntaplay.com<br />
                  <strong>Endereço:</strong> [Endereço da empresa]
                </p>
              </div>
            </section>

            <div className="pt-6 border-t">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyComplete;
