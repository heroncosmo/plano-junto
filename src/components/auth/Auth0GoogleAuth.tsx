import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from './SocialIcons';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Configuração do Auth0
const auth0Config = {
  domain: 'juntaplay.auth0.com', // Você precisa criar no Auth0
  clientId: 'SEU_CLIENT_ID_AQUI',
  redirectUri: window.location.origin + '/privacy-policy?fromSignup=true'
};

// Tipos do Auth0
declare global {
  interface Window {
    auth0: any;
  }
}

const Auth0GoogleAuth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Carregar Auth0 SDK
    const script = document.createElement('script');
    script.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = async () => {
      try {
        window.auth0 = await window.createAuth0Client({
          domain: auth0Config.domain,
          clientId: auth0Config.clientId,
          authorizationParams: {
            redirect_uri: auth0Config.redirectUri
          }
        });

        // Verificar se retornou do login
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
          await handleRedirectCallback();
        }
      } catch (error) {
        console.error('Erro ao inicializar Auth0:', error);
      }
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const handleRedirectCallback = async () => {
    try {
      await window.auth0.handleRedirectCallback();
      const user = await window.auth0.getUser();
      
      if (user) {
        // Salvar usuário
        localStorage.setItem('juntaplay_user', JSON.stringify({
          id: user.sub,
          email: user.email,
          name: user.name,
          avatar: user.picture,
          provider: 'google-auth0'
        }));

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${user.name}!`,
        });

        // Limpar URL
        window.history.replaceState({}, document.title, '/privacy-policy?fromSignup=true');
      }
    } catch (error: any) {
      console.error('Erro no callback:', error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      if (!window.auth0) {
        throw new Error('Auth0 não carregado');
      }

      await window.auth0.loginWithRedirect({
        authorizationParams: {
          connection: 'google-oauth2',
          redirect_uri: auth0Config.redirectUri
        }
      });
    } catch (error: any) {
      console.error('Erro no login Auth0:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="outline"
      className="w-full"
    >
      <GoogleIcon className="mr-2 h-4 w-4" />
      Entrar com Google (Auth0)
    </Button>
  );
};

export default Auth0GoogleAuth;
