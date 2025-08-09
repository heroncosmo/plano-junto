import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AuthTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { signUp, signIn, signInWithGoogle, resendConfirmation, user, signOut } = useAuth();
  const { toast } = useToast();

  const testEmailSignup = async () => {
    setLoading(true);
    setResult('');
    try {
      const { error } = await signUp('teste.novo@juntaplay.com', '123456');
      if (error) {
        setResult(`Erro no registro: ${error.message}`);
      } else {
        setResult('Registro realizado com sucesso! Verifique o email para confirmação.');
        toast({
          title: "Registro realizado!",
          description: "Verifique seu email para confirmar a conta",
        });
      }
    } catch (err: any) {
      setResult(`Exceção: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testEmailLogin = async () => {
    setLoading(true);
    setResult('');
    try {
      const { error } = await signIn('teste@juntaplay.com', '123456');
      if (error) {
        setResult(`Erro no login: ${error.message}`);
      } else {
        setResult('Login realizado com sucesso!');
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao JuntaPlay",
        });
      }
    } catch (err: any) {
      setResult(`Exceção: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleOAuth = async () => {
    setLoading(true);
    setResult('');
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setResult(`Erro no Google OAuth: ${error.message}`);
      } else {
        setResult('Redirecionando para Google...');
      }
    } catch (err: any) {
      setResult(`Exceção Google: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  const testResendConfirmation = async () => {
    setLoading(true);
    setResult('');
    try {
      const { error } = await resendConfirmation('teste.novo@juntaplay.com');
      if (error) {
        setResult(`Erro ao reenviar confirmação: ${error.message}`);
      } else {
        setResult('Email de confirmação reenviado com sucesso!');
        toast({
          title: "Email reenviado!",
          description: "Verifique sua caixa de entrada",
        });
      }
    } catch (err: any) {
      setResult(`Exceção: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setResult('Logout realizado com sucesso!');
      toast({
        title: "Logout realizado!",
        description: "Até logo!",
      });
    } catch (err: any) {
      setResult(`Erro no logout: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste do Sistema de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <Alert>
              <AlertDescription>
                <strong>Usuário logado:</strong> {user.email} 
                {user.email_confirmed_at ? ' (Email confirmado)' : ' (Email NÃO confirmado)'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Autenticação por Email/Senha</h3>
              <Button 
                onClick={testEmailSignup} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Testar Registro (teste.novo@juntaplay.com)
              </Button>
              <Button 
                onClick={testEmailLogin} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Testar Login (teste@juntaplay.com)
              </Button>
              <Button 
                onClick={testResendConfirmation} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Reenviar Confirmação
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">OAuth Social</h3>
              <Button 
                onClick={testGoogleOAuth} 
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                Testar Google OAuth
              </Button>

            </div>
          </div>

          {user && (
            <Button 
              onClick={handleSignOut} 
              disabled={loading}
              className="w-full"
              variant="destructive"
            >
              Fazer Logout
            </Button>
          )}

          {result && (
            <Alert>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthTest;
