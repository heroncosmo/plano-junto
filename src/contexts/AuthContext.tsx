import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 DEBUG - AuthContext: Configurando listener de autenticação...');

    // Verificar se há sessão do Google OAuth no localStorage
    const checkGoogleSession = () => {
      const googleUser = localStorage.getItem('juntaplay_user');
      if (googleUser) {
        try {
          const userData = JSON.parse(googleUser);
          if (userData.provider === 'google') {
            // Simular usuário do Supabase para compatibilidade
            const mockUser = {
              id: userData.id,
              email: userData.email,
              user_metadata: {
                full_name: userData.name,
                avatar_url: userData.avatar
              }
            } as any;

            const mockSession = {
              user: mockUser,
              access_token: 'google-oauth-token'
            } as any;

            setUser(mockUser);
            setSession(mockSession);
            setLoading(false);
            return true;
          }
        } catch (error) {
          console.error('Erro ao verificar sessão do Google:', error);
        }
      }
      return false;
    };

    // Verificar sessão do Google primeiro
    if (checkGoogleSession()) {
      return;
    }

    // Set up auth state listener para Supabase Auth (cadastro manual)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔍 DEBUG - AuthContext: Evento de autenticação Supabase:', event, { session: !!session, user: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 DEBUG - AuthContext: Sessão inicial Supabase:', { session: !!session, user: !!session?.user });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Use o domínio correto baseado no ambiente
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isLocalhost
      ? `${window.location.origin}/app`
      : 'https://juntaplay.lojapplace.com/app';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    // Use o domínio correto baseado no ambiente
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isLocalhost
      ? `${window.location.origin}/privacy-policy?fromSignup=true`
      : 'https://juntaplay.lojapplace.com/privacy-policy?fromSignup=true';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };



  const resendConfirmation = async (email: string) => {
    // Use o domínio correto baseado no ambiente
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const redirectUrl = isLocalhost
      ? `${window.location.origin}/app`
      : 'https://juntaplay.lojapplace.com/app';

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    console.log('🔍 DEBUG - Iniciando logout...');
    try {
      // Limpar sessão do Google se existir
      localStorage.removeItem('juntaplay_user');
      localStorage.removeItem('sb-geojqrpzcyiyhjzobggy-auth-token');
      console.log('🔍 DEBUG - Dados do Google removidos');

      // Primeiro, limpa o estado local
      setUser(null);
      setSession(null);
      console.log('🔍 DEBUG - Estado local limpo primeiro');

      // Depois, chama o signOut do Supabase
      const { error } = await supabase.auth.signOut();
      console.log('🔍 DEBUG - Resultado do logout:', { error });
      if (error) {
        console.error('❌ ERRO no logout:', error);
      } else {
        console.log('✅ Logout realizado com sucesso');
        // Força a limpeza do estado local novamente
        setUser(null);
        setSession(null);
        console.log('🔍 DEBUG - Estado local limpo novamente');
      }
    } catch (err) {
      console.error('❌ EXCEÇÃO no logout:', err);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,

    signOut,
    resendConfirmation
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};