import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from './SocialIcons';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Tipos do Google
declare global {
  interface Window {
    google: any;
    googleSignInCallback: (response: any) => void;
  }
}

const GoogleAuthDirect: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Carregar o script do Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Configurar callback global
    window.googleSignInCallback = handleGoogleResponse;

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '369914514587-b9lrbegfe6tfma331hti1dgqsgjoom0q.apps.googleusercontent.com',
          callback: window.googleSignInCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    };

    return () => {
      document.head.removeChild(script);
      delete window.googleSignInCallback;
    };
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      // Decodificar o JWT do Google
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));

      console.log('Google User Info:', payload);

      // Verificar se o usuário já existe na tabela profiles
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', payload.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let userProfile;

      if (existingProfile) {
        // Usuário já existe - atualizar dados do Google se necessário
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            google_id: payload.sub,
            avatar_url: payload.picture,
            provider: 'google',
            email_confirmed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProfile.id)
          .select()
          .single();

        if (updateError) throw updateError;
        userProfile = updatedProfile;

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo de volta, ${payload.name}!`,
        });
      } else {
        // Criar novo usuário diretamente na tabela profiles
        const newUserId = crypto.randomUUID();
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            user_id: newUserId, // ID fictício para manter compatibilidade
            email: payload.email,
            full_name: payload.name,
            avatar_url: payload.picture,
            provider: 'google',
            google_id: payload.sub,
            email_confirmed: true,
            balance_cents: 0,
            verification_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;
        userProfile = newProfile;

        toast({
          title: "Conta criada com sucesso!",
          description: `Bem-vindo ao JuntaPlay, ${payload.name}!`,
        });
      }

      // Salvar dados do usuário no localStorage para simular sessão do Supabase
      localStorage.setItem('juntaplay_user', JSON.stringify({
        id: userProfile.user_id,
        email: userProfile.email,
        name: userProfile.full_name,
        avatar: userProfile.avatar_url,
        provider: 'google',
        profile_id: userProfile.id
      }));

      // Simular sessão do Supabase para compatibilidade
      localStorage.setItem('sb-geojqrpzcyiyhjzobggy-auth-token', JSON.stringify({
        access_token: 'google-oauth-token',
        refresh_token: 'google-refresh-token',
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
        user: {
          id: userProfile.user_id,
          email: userProfile.email,
          user_metadata: {
            full_name: userProfile.full_name,
            avatar_url: userProfile.avatar_url
          }
        }
      }));

      // Redirecionar para políticas de privacidade
      navigate('/privacy-policy?fromSignup=true');

    } catch (error: any) {
      console.error('Erro no login com Google:', error);

      // Não mostrar erro se foi apenas cancelamento pelo usuário
      if (error.message && error.message.includes('popup_closed_by_user')) {
        console.log('Login cancelado pelo usuário');
        return;
      }

      toast({
        title: "Erro no login",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      try {
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Se o prompt não foi exibido, tentar renderizar o botão
            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'continue_with'
              }
            );
          }
        });
      } catch (error) {
        console.log('Prompt não disponível, usando renderButton');
        // Fallback para renderButton se prompt falhar
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with'
          });
        }
      }
    } else {
      toast({
        title: "Erro",
        description: "Google não carregado. Recarregue a página.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleGoogleLogin}
        variant="outline"
        className="w-full"
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        Continuar com Google
      </Button>

      {/* Container para o botão nativo do Google (fallback) */}
      <div id="google-signin-button" className="mt-2 hidden"></div>
    </div>
  );
};

export default GoogleAuthDirect;
