import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Plus, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Estado para controlar as preferências de privacidade
  const [preferences, setPreferences] = useState({
    communication: false,
    financial: false,
    marketing: true
  });

  // Verificar se veio do processo de cadastro
  const isFromSignup = location.state?.fromSignup || location.search.includes('fromSignup=true');
  const userEmail = location.state?.email || user?.email || '';

  // Verificar se há tokens de OAuth na URL (indicando retorno do Google)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get('access_token');

    if (accessToken) {
      console.log('🔍 DEBUG - Usuário retornou do Google OAuth');
      // Limpar a URL para evitar problemas
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, []);

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAcceptAndContinue = () => {
    // Salvar preferências (aqui você pode implementar a lógica para salvar no backend)
    console.log('Preferências de privacidade salvas:', preferences);

    // Sempre redirecionar para o app após aceitar as políticas
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="container mx-auto px-4 py-4 max-w-3xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
              Políticas de Privacidade
              <span className="text-xl">🔒</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Saudação personalizada */}
            <div className="text-center">
              <p className="text-base text-gray-700">
                Olá, <strong>{userEmail ? userEmail.split('@')[0] : 'usuário'}</strong> bem-vindo(a) ao JuntaPlay!
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Personalize suas preferências de privacidade:
              </p>
            </div>

            {/* Tópicos importantes */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900">Tópicos importantes</h3>

              {/* Comunicação e Suporte */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Comunicação, Suporte*</p>
                    <p className="text-xs text-gray-600">
                      Emails essenciais sobre sua conta e grupos
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.communication}
                  onCheckedChange={() => handlePreferenceChange('communication')}
                />
              </div>

              {/* Financeiro e Obrigações Legais */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Financeiro, Obrigações legais*</p>
                    <p className="text-xs text-gray-600">
                      Pagamentos, conformidade legal e segurança
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.financial}
                  onCheckedChange={() => handlePreferenceChange('financial')}
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Marketing</p>
                    <p className="text-xs text-gray-600">
                      Novidades e promoções do JuntaPlay
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={() => handlePreferenceChange('marketing')}
                />
              </div>
            </div>

            {/* Nota sobre políticas obrigatórias */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                As políticas marcadas com <strong>*</strong> são obrigatórias.
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Ao continuar, você concorda com nossos{' '}
                <a href="/terms-of-service" className="text-blue-600 underline hover:text-blue-800">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="/politica-de-privacidade-completa" className="text-blue-600 underline hover:text-blue-800">
                  Política de Privacidade
                </a>
                .
              </p>
            </div>

            {/* Botão de aceitar */}
            <div className="pt-2">
              <Button
                onClick={handleAcceptAndContinue}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 text-base font-semibold"
              >
                <Check className="mr-2 h-5 w-5" />
                Aceitar e continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
