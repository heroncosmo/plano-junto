import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useAuth();

  console.log('🔍 DEBUG - RequireAuth:', { user: !!user, loading });

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, redireciona imediatamente para auth
  if (!user) {
    console.log('🔍 DEBUG - RequireAuth: Usuário não logado, redirecionando para /auth');
    return <Navigate to="/auth" replace />;
  }

  // Se está logado, renderiza o conteúdo protegido
  console.log('🔍 DEBUG - RequireAuth: Usuário logado, renderizando conteúdo');
  return <>{children}</>;
};

export default RequireAuth;