import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Termos de Uso - JuntaPlay
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
              <p className="text-gray-700">
                Ao acessar e usar o JuntaPlay, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
              <p className="text-gray-700">
                O JuntaPlay é uma plataforma que facilita a criação e participação em grupos para compartilhamento 
                de assinaturas de serviços digitais, permitindo que usuários dividam custos de forma organizada e segura.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Responsabilidades do Usuário</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Usar o serviço de forma legal e ética</li>
                <li>Respeitar os direitos dos outros usuários</li>
                <li>Cumprir com os pagamentos acordados nos grupos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Pagamentos e Reembolsos</h2>
              <p className="text-gray-700">
                Os pagamentos são processados através de nossa plataforma. Reembolsos podem ser solicitados 
                conforme nossa política de reembolso, disponível em nossa central de ajuda.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Privacidade</h2>
              <p className="text-gray-700">
                Sua privacidade é importante para nós. Consulte nossa{' '}
                <a href="/politica-de-privacidade-completa" className="text-blue-600 underline hover:text-blue-800">
                  Política de Privacidade
                </a>{' '}
                para entender como coletamos, usamos e protegemos suas informações.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Limitação de Responsabilidade</h2>
              <p className="text-gray-700">
                O JuntaPlay não se responsabiliza por problemas relacionados aos serviços de terceiros 
                compartilhados através da plataforma. Nossa responsabilidade se limita à facilitação 
                da organização dos grupos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Modificações dos Termos</h2>
              <p className="text-gray-700">
                Reservamos o direito de modificar estes termos a qualquer momento. As alterações 
                entrarão em vigor imediatamente após a publicação na plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contato</h2>
              <p className="text-gray-700">
                Para dúvidas sobre estes termos, entre em contato conosco através da nossa 
                central de ajuda ou pelo email: suporte@juntaplay.com
              </p>
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

export default TermsOfService;
