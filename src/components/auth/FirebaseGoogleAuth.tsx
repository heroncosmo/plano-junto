import React from 'react';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from './SocialIcons';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Configuração do Firebase (você precisa criar um projeto no Firebase)
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "juntaplay.firebaseapp.com",
  projectId: "juntaplay",
  storageBucket: "juntaplay.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Tipos do Firebase
declare global {
  interface Window {
    firebase: any;
  }
}

const FirebaseGoogleAuth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const initializeFirebase = async () => {
    // Carregar Firebase dinamicamente
    if (!window.firebase) {
      const script1 = document.createElement('script');
      script1.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.src = 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
      document.head.appendChild(script2);

      await new Promise(resolve => {
        script2.onload = resolve;
      });

      // Inicializar Firebase
      window.firebase.initializeApp(firebaseConfig);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await initializeFirebase();
      
      const auth = window.firebase.auth();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      
      // Configurar scopes
      provider.addScope('email');
      provider.addScope('profile');

      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      console.log('Firebase User:', user);

      // Salvar no localStorage
      localStorage.setItem('juntaplay_user', JSON.stringify({
        id: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
        provider: 'google-firebase'
      }));

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${user.displayName}!`,
      });

      // Redirecionar
      navigate('/privacy-policy?fromSignup=true');

    } catch (error: any) {
      console.error('Erro no Firebase Auth:', error);
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
      Entrar com Google (Firebase)
    </Button>
  );
};

export default FirebaseGoogleAuth;
