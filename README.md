# JuntaPlay - Economize em Assinaturas

## Sobre o Projeto

JuntaPlay é uma plataforma que permite que pessoas se juntem para economizar em assinaturas de streaming, música, educação e muito mais. Junte-se a milhares de pessoas economizando juntas!

## Como editar este código?

Existem várias maneiras de editar sua aplicação.

**Use seu IDE preferido**

Se você quiser trabalhar localmente usando seu próprio IDE, você pode clonar este repo e fazer push das mudanças.

O único requisito é ter Node.js & npm instalados - [instale com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <YOUR_GIT_URL>

# Passo 2: Navegue até o diretório do projeto.
cd <YOUR_PROJECT_NAME>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com auto-reload e preview instantâneo.
npm run dev
```

**Edite um arquivo diretamente no GitHub**

- Navegue até o(s) arquivo(s) desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas mudanças e faça commit das mudanças.

**Use GitHub Codespaces**

- Navegue até a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para iniciar um novo ambiente Codespace.
- Edite arquivos diretamente dentro do Codespace e faça commit e push das suas mudanças quando terminar.

## Quais tecnologias são usadas neste projeto?

Este projeto é construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (PostgreSQL)

## Como posso fazer deploy deste projeto?

Você pode fazer deploy usando qualquer plataforma de hospedagem que suporte aplicações React/Vite, como:

- Vercel
- Netlify
- GitHub Pages
- Railway
- Render

## Funcionalidades Principais

- ✅ **Grupos de Assinatura**: Crie e participe de grupos para economizar
- ✅ **Fluxo de Checkout**: Processo completo de pagamento
- ✅ **Múltiplos Métodos de Pagamento**: Saldo, PIX, Cartão de Crédito
- ✅ **Interface Responsiva**: Funciona perfeitamente em mobile e desktop
- ✅ **Design Minimalista**: Seguindo as melhores práticas de UX

## Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Custom hooks
├── contexts/      # Contextos React
├── integrations/  # Integrações externas (Supabase)
└── lib/          # Utilitários
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
