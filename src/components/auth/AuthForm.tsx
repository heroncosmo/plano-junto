import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GoogleIcon, FacebookIcon } from './SocialIcons';

type AuthMode = 'login' | 'register' | 'confirm-email';

const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const { user, signIn, signUp, signInWithGoogle, signInWithFacebook, resendConfirmation } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/app" replace />;
  }

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setRegisteredEmail(email);
            setMode('confirm-email');
            toast({
              title: "Email não confirmado",
              description: "Por favor, confirme seu email antes de fazer login",
              variant: "destructive"
            });
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo de volta ao JuntaPlay",
          });
          setTimeout(() => {
            navigate('/app');
          }, 1000);
        }
      } else if (mode === 'register') {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setRegisteredEmail(email);
          setMode('confirm-email');
          toast({
            title: "Conta criada com sucesso!",
            description: "Verifique seu email para confirmar sua conta",
          });
        }
      }
    } catch (err: any) {
      setError('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');

    try {
      const { error } = provider === 'google'
        ? await signInWithGoogle()
        : await signInWithFacebook();

      if (error) {
        if (error.message.includes('OAuth')) {
          setError(`${provider === 'google' ? 'Google' : 'Facebook'} OAuth não está configurado. Configure as credenciais no Supabase Dashboard.`);
        } else {
          setError(error.message);
        }
      } else {
        // OAuth redirect will happen automatically, no need to handle success here
        toast({
          title: "Redirecionando...",
          description: `Conectando com ${provider === 'google' ? 'Google' : 'Facebook'}`,
        });
      }
    } catch (err: any) {
      setError(`Erro ao conectar com ${provider === 'google' ? 'Google' : 'Facebook'}: ${err.message || 'Tente novamente'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await resendConfirmation(registeredEmail);
      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "Email de confirmação reenviado!",
          description: "Verifique sua caixa de entrada",
        });
      }
    } catch (err: any) {
      setError('Erro ao reenviar email de confirmação');
    } finally {
      setLoading(false);
    }
  };

  const renderConfirmEmailView = () => (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h3 className="text-lg font-semibold">Confirme seu email</h3>
      <p className="text-muted-foreground">
        Enviamos um link de confirmação para <strong>{registeredEmail}</strong>
      </p>
      <p className="text-sm text-muted-foreground">
        Clique no link do email para ativar sua conta. Não recebeu o email?
      </p>
      
      <div className="space-y-2">
        <Button 
          onClick={handleResendConfirmation}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? 'Reenviando...' : 'Reenviar email de confirmação'}
        </Button>
        
        <Button 
          onClick={() => {
            setMode('login');
            setRegisteredEmail('');
            setError('');
          }}
          variant="ghost"
          className="w-full"
        >
          Voltar ao login
        </Button>
      </div>
    </div>
  );

  const renderAuthForm = () => (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          {mode === 'login' ? 'Entrar' : 'Criar Conta'}
        </CardTitle>
        <p className="text-muted-foreground">
          {mode === 'login' 
            ? 'Acesse sua conta no JuntaPlay' 
            : 'Junte-se à comunidade JuntaPlay'
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              {error.includes('OAuth não está configurado') && (
                <div className="mt-2">
                  <Link to="/oauth-setup">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Ver instruções de configuração OAuth
                    </Button>
                  </Link>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-2">
          <Button 
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            {mode === 'login' ? 'Entrar' : 'Cadastrar'} com Google
          </Button>
          
          <Button 
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <FacebookIcon className="mr-2 h-4 w-4" />
            {mode === 'login' ? 'Entrar' : 'Cadastrar'} com Facebook
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Ou continue com email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>{mode === 'login' ? 'Entrando...' : 'Criando conta...'}</span>
              </div>
            ) : (
              mode === 'login' ? 'Entrar' : 'Criar Conta'
            )}
          </Button>
        </form>

        <Separator />

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="ml-1 text-cyan-600 hover:underline font-medium"
            >
              {mode === 'login' ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        {mode === 'confirm-email' ? renderConfirmEmailView() : renderAuthForm()}
      </Card>
    </div>
  );
};

export default AuthForm;
