# Configuração do Vercel

## Problema Resolvido: Erro 404

O arquivo `vercel.json` foi criado para resolver o problema de roteamento. Ele redireciona todas as rotas para o `index.html`, permitindo que o React Router funcione corretamente.

## Variáveis de Ambiente Necessárias

Configure estas variáveis no painel do Vercel:

### 1. Acesse o Dashboard do Vercel
- Vá para https://vercel.com/dashboard
- Selecione seu projeto `plano-junto`

### 2. Configure as Variáveis de Ambiente
Vá em **Settings** > **Environment Variables** e adicione:

```
VITE_SUPABASE_URL = https://geojqrpzcyiyhjzobggy.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlb2pxcnB6Y3lpeWhqem9iZ2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Nzg2MjksImV4cCI6MjA2OTU1NDYyOX0.GOYSjVMwIIrmCaTWc6lXUadCyIclaMYeqRrwapiFWg8
```

### 3. Redeploy
Após configurar as variáveis:
- Vá em **Deployments**
- Clique em **Redeploy** no último deployment

## Estrutura do vercel.json

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### O que cada parte faz:

- **rewrites**: Redireciona todas as rotas para `index.html`, permitindo que o React Router funcione
- **headers**: Configura cache para arquivos estáticos, melhorando a performance

## Teste

Após o redeploy, teste acessando diretamente:
- https://juntaplay.vercel.app/groups
- https://juntaplay.vercel.app/create-group
- https://juntaplay.vercel.app/payment

Todas devem funcionar sem erro 404! 