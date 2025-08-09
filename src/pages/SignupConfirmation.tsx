import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SignupConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="shadow-xl border-0">
          <CardContent className="p-12 text-center">
            {/* Success Icon */}
            <div className="mb-8">
              <div className="relative mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Main Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bem-vindo ao JuntaPlay! 🎉
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Sua conta foi criada com sucesso!
            </p>

            {/* Email Confirmation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Confirme seu email
                </h3>
              </div>
              
              <p className="text-blue-800 mb-4">
                Enviamos um link de confirmação para:
              </p>
              
              <div className="bg-white border border-blue-300 rounded-md p-3 mb-4">
                <span className="font-mono text-blue-900">{email}</span>
              </div>
              
              <p className="text-sm text-blue-700">
                Clique no link do email para ativar sua conta e começar a usar o JuntaPlay.
              </p>
            </div>

            {/* Next Steps */}
            <div className="text-left bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                Próximos passos:
              </h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                  <span>Verifique sua caixa de entrada (e spam) para o email de confirmação</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                  <span>Clique no link de confirmação no email</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                  <span>Faça login e comece a criar ou participar de grupos</span>
                </li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/privacy-policy', { state: { fromSignup: true, email } })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                Configurar Preferências de Privacidade
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Ir para Login
              </Button>

              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>

            {/* Legal Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                Ao criar sua conta, você concorda com nossos:
              </p>
              <div className="flex justify-center space-x-4 text-xs">
                <button 
                  onClick={() => navigate('/termos-de-uso')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Termos de Uso
                </button>
                <span className="text-gray-400">•</span>
                <button 
                  onClick={() => navigate('/politica-de-privacidade')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Política de Privacidade
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default SignupConfirmation;
