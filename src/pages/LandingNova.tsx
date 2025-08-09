import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Users,
  Percent,
  Clock,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Sparkles,
  ArrowRight,
  MessageSquareQuote,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const TrustBar = () => {
  return (
    <div className="bg-muted/50 border-y">
      <div className="max-w-6xl mx-auto px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
        <div className="text-center text-sm text-muted-foreground">Citado no <span className="font-semibold text-foreground">InfoMoney</span></div>
        <div className="text-center text-sm text-muted-foreground">Cobertura no <span className="font-semibold text-foreground">Estadão</span></div>
        <div className="text-center text-sm text-muted-foreground">Avaliado 4.9/5 pelos usuários</div>
        <div className="text-center text-sm text-muted-foreground">Mais de 500 serviços disponíveis</div>
      </div>
    </div>
  );
};

const Benefits = () => {
  const items = [
    { icon: Percent, title: 'Economize até 80%', desc: 'Divida assinaturas com segurança e pague apenas sua parte.' },
    { icon: ShieldCheck, title: 'Seguro e transparente', desc: 'Intermediação de pagamentos, termos claros e suporte humano.' },
    { icon: Users, title: 'Comunidade confiável', desc: 'Grupos verificados e reputação de organizadores.' },
    { icon: Clock, title: 'Rápido de começar', desc: 'Crie ou entre em um grupo em minutos, sem burocracia.' },
  ];

  return (
    <section className="max-w-6xl mx-auto px-8 py-16">
      <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-3">Por que usar o JuntaPlay</Badge>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Feito para economizar sem complicação</h2>
        <p className="text-muted-foreground mt-2">Inspirado nos melhores do mundo como Kotas, Spliiit, ShareSub e TogetherPrice — com o nosso toque minimalista.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="h-full">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <CardTitle className="text-base mt-2">{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: 'Escolha o serviço', desc: 'Selecione streaming, música, design e centenas de outros.', icon: Sparkles },
    { title: 'Crie ou entre em um grupo', desc: 'Em poucos cliques, sem exigir dados sensíveis.', icon: Users },
    { title: 'Pague com segurança', desc: 'Intermediação de pagamentos e comprovantes claros.', icon: CreditCard },
    { title: 'Aproveite juntos', desc: 'Economia recorrente e controle simples do seu plano.', icon: CheckCircle2 },
  ];

  return (
    <section className="bg-background">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">Como funciona</Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Comece em minutos</h2>
          <p className="text-muted-foreground mt-2">Fluxo pensado com psicologia de decisão: clareza, baixo esforço e prova social.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ title, desc, icon: Icon }) => (
            <Card key={title} className="h-full">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-base mt-2">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button size="lg" className="px-6">
            Começar agora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

const SocialProof = () => {
  return (
    <section className="max-w-6xl mx-auto px-8 py-16">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Badge variant="secondary" className="mb-3">Opiniões reais</Badge>
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight">A escolha de quem quer economizar com segurança</h3>
          <p className="text-muted-foreground mt-2">Mensagens breves, linguagem positiva e benefícios concretos — do jeito que o cérebro decide rápido.</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-cyan-600"><MessageSquareQuote className="w-5 h-5" /></div>
              <p className="text-sm text-muted-foreground">“Paguei metade do preço e configurei tudo em 3 minutos.” — Fernanda, SP</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 text-cyan-600"><MessageSquareQuote className="w-5 h-5" /></div>
              <p className="text-sm text-muted-foreground">“Perfeito para dividir com amigos sem dor de cabeça.” — Carlos, RJ</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 text-cyan-600"><MessageSquareQuote className="w-5 h-5" /></div>
              <p className="text-sm text-muted-foreground">“Mais claro e confiável do que outras plataformas.” — Júlia, MG</p>
            </div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pronto no celular e no computador</CardTitle>
            <CardDescription>Experiência rápida e consistente onde você estiver.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-muted-foreground">
              <Smartphone className="w-5 h-5" />
              <span>Interface minimalista e responsiva</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

const FAQ = () => {
  return (
    <section className="bg-muted/30 border-t">
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3">Dúvidas comuns</Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tudo claro desde o início</h2>
          <p className="text-muted-foreground mt-2">Respostas diretas para decisões rápidas.</p>
        </div>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          <AccordionItem value="item-1">
            <AccordionTrigger>É legal compartilhar uma assinatura?</AccordionTrigger>
            <AccordionContent>
              Sim. Você compartilha o custo do plano e paga somente sua parte. Não somos afiliados aos serviços — atuamos como intermediador de pagamentos.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Como é feito o pagamento?</AccordionTrigger>
            <AccordionContent>
              Via parceiros de pagamento com recibos claros. Você pode criar ou entrar em grupos aprovados e acompanhar tudo pelo painel.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Posso cancelar quando quiser?</AccordionTrigger>
            <AccordionContent>
              Sim. Você mantém total controle do seu grupo e pode sair quando desejar, conforme as regras do serviço escolhido.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

const CTA = () => {
  return (
    <section className="border-t">
      <div className="max-w-6xl mx-auto px-8 py-16 text-center">
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Comece agora e pague menos nas suas assinaturas</h3>
        <p className="text-muted-foreground mt-2">Sem filtros confusos. Um caminho simples e seguro para economizar.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button size="lg" className="px-6">Criar novo grupo</Button>
          <Button size="lg" variant="secondary" className="px-6">Encontrar um grupo</Button>
        </div>
      </div>
    </section>
  );
};

const LandingNova = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <TrustBar />
      <Benefits />
      <HowItWorks />
      <SocialProof />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingNova;
