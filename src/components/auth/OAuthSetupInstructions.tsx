import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const OAuthSetupInstructions = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast({
        title: "Copiado!",
        description: `${label} copiado para a área de transferência`,
      });
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto",
        variant: "destructive"
      });
    }
  };

  const redirectUrl = "https://geojqrpzcyiyhjzobggy.supabase.co/auth/v1/callback";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Configuração OAuth</h1>
        <p className="text-muted-foreground">
          Configure Google e Facebook OAuth para habilitar login social
        </p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>OAuth habilitado no Supabase!</strong> Agora você precisa configurar as credenciais do Google e Facebook.
        </AlertDescription>
      </Alert>

      {/* Google OAuth Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            Configurar Google OAuth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Acesse o Google Cloud Console</h4>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
              className="w-full justify-start"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Google Cloud Console
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">2. Criar/Selecionar Projeto</h4>
            <p className="text-sm text-muted-foreground">
              Crie um novo projeto ou selecione um existente
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">3. Habilitar Google+ API</h4>
            <p className="text-sm text-muted-foreground">
              Vá em "APIs & Services" → "Library" → Procure por "Google+ API" → Habilite
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">4. Criar Credenciais OAuth</h4>
            <p className="text-sm text-muted-foreground">
              Vá em "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Application type: Web application</li>
              <li>Name: JuntaPlay</li>
              <li>Authorized redirect URIs:</li>
            </ul>
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <code className="flex-1 text-sm">{redirectUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(redirectUrl, "Redirect URL")}
              >
                {copiedText === "Redirect URL" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">5. Configurar no Supabase</h4>
            <p className="text-sm text-muted-foreground">
              Copie o Client ID e Client Secret e configure no Supabase Dashboard:
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://supabase.com/dashboard/project/geojqrpzcyiyhjzobggy/auth/providers', '_blank')}
              className="w-full justify-start"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Configurações Auth no Supabase
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Facebook OAuth Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
            Configurar Facebook OAuth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Acesse o Facebook Developers</h4>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://developers.facebook.com/', '_blank')}
              className="w-full justify-start"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Facebook Developers
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">2. Criar App</h4>
            <p className="text-sm text-muted-foreground">
              Clique em "Create App" → Selecione "Consumer" → Preencha os dados do app
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">3. Adicionar Facebook Login</h4>
            <p className="text-sm text-muted-foreground">
              No dashboard do app, clique em "Add Product" → Selecione "Facebook Login"
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">4. Configurar Redirect URIs</h4>
            <p className="text-sm text-muted-foreground">
              Em "Facebook Login" → "Settings", adicione a URL de redirect:
            </p>
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <code className="flex-1 text-sm">{redirectUrl}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(redirectUrl, "Facebook Redirect URL")}
              >
                {copiedText === "Facebook Redirect URL" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">5. Obter Credenciais</h4>
            <p className="text-sm text-muted-foreground">
              Vá em "Settings" → "Basic" para encontrar App ID e App Secret
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">6. Configurar no Supabase</h4>
            <p className="text-sm text-muted-foreground">
              Configure o App ID e App Secret no Supabase Dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Importante:</strong> Após configurar as credenciais OAuth, o login social funcionará automaticamente. 
          O sistema já está preparado para criar contas automaticamente via OAuth.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OAuthSetupInstructions;
