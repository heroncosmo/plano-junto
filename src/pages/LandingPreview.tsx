import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Shield, CheckCircle, ArrowRight, Play, Music, Video, Gamepad2, BookOpen, Palette, Code, Heart, Star, TrendingUp, Zap } from "lucide-react";

const LandingPreview = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Inspirado no Vakinha + Kotas */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            {/* Badge com movimento */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-lg animate-pulse-slow animate-fade-in-up">
              <Zap className="w-4 h-4 mr-2" />
              Plataforma de compartilhamento de assinaturas
            </div>

            {/* Título Principal - Estilo Vakinha */}
            <h1 className="text-4xl lg:text-7xl font-bold leading-tight text-gray-900">
              Divida assinaturas e{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                economize dinheiro
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              Conecte-se com pessoas que querem dividir os custos de serviços digitais.
              <span className="text-cyan-600 font-semibold"> Simples, seguro e transparente.</span>
            </p>

            {/* Benefícios Principais */}
            <div className="flex items-center justify-center space-x-2 py-4">
              <div className="flex items-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-cyan-500" />
                  <span className="font-medium">Entrega de código de acesso ultrarápida</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-cyan-500" />
                  <span className="font-medium">Cancele a qualquer momento, com um clique</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                  <span className="font-medium">Uma maneira simples e legal de economizar dinheiro</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all">
                <Link to="/auth">
                  Começar gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="text-lg px-8 py-6 border-2 border-gray-300 rounded-xl hover:border-cyan-500 hover:text-cyan-600 transition-all">
                <Link to="/grupos">
                  <Play className="w-5 h-5 mr-2" />
                  Ver como funciona
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Gratuito para começar</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="font-medium">Plataforma segura</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="font-medium">Economia real</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Populares - Estilo Spliiit/TogetherPrice */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Categorias de serviços disponíveis
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore as diferentes categorias de serviços que você pode compartilhar
            </p>
          </div>

          {/* Grid de Serviços */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto mb-12">
            {[
              { name: "Streaming de Música", description: "Plataformas de música", color: "bg-green-500", icon: Music },
              { name: "Plataforma de Vídeo", description: "Conteúdo audiovisual", color: "bg-red-600", icon: Video },
              { name: "Streaming Premium", description: "Filmes e séries", color: "bg-red-500", icon: Play },
              { name: "Entretenimento Familiar", description: "Conteúdo para toda família", color: "bg-blue-600", icon: Video },
              { name: "Design Profissional", description: "Ferramentas criativas", color: "bg-purple-500", icon: Palette },
              { name: "Pacote Office", description: "Suítes de produtividade", color: "bg-blue-500", icon: Code },
              { name: "E-commerce Premium", description: "Benefícios de compra", color: "bg-orange-500", icon: BookOpen },
              { name: "Aprendizado de Idiomas", description: "Cursos e educação", color: "bg-green-600", icon: BookOpen },
              { name: "IA Conversacional", description: "Inteligência artificial", color: "bg-gray-800", icon: Code },
              { name: "Suite Criativa", description: "Ferramentas de design", color: "bg-red-600", icon: Palette },
              { name: "Anime e Mangá", description: "Conteúdo asiático", color: "bg-orange-600", icon: Video },
              { name: "Gaming Online", description: "Jogos e entretenimento", color: "bg-red-500", icon: Gamepad2 }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-4 hover-lift hover:border-cyan-300 transition-all duration-300 group animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform animate-float`} style={{animationDelay: `${index * 0.2}s`}}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{service.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{service.description}</p>
                <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-xs py-2 rounded-lg">
                  Explorar
                </Button>
              </div>
            ))}
          </div>

          {/* CTA Central */}
          <div className="text-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg">
              <Link to="/auth">Ver todos os serviços</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Como Funciona - Estilo TogetherPrice */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Como funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Juntamos proprietários de assinaturas com co-assinantes à procura de vagas disponíveis
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Proprietários */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Proprietários</h3>
              <p className="text-gray-600 text-lg">Proponha as suas vagas</p>
              <p className="text-gray-500">Asseguramos os pagamentos dos seus co-assinantes.</p>

              <div className="space-y-4 pt-4">
                {[
                  "1. Crie um grupo de compartilhamento",
                  "2. Adicione membros ao grupo",
                  "3. Receba sua parte da conta"
                ].map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Co-assinantes */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Co-assinantes</h3>
              <p className="text-gray-600 text-lg">Junte-se a uma assinatura</p>
              <p className="text-gray-500">Aceda às assinaturas e desfrute sem fidelização.</p>

              <div className="space-y-4 pt-4">
                {[
                  "1. Encontre um grupo disponível",
                  "2. Junte-se ao grupo",
                  "3. Pague apenas sua parte"
                ].map((step, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Central Destacada - Estilo Spliiit */}
      <section className="py-20 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 gap-4 h-full">
            {Array.from({length: 64}).map((_, i) => (
              <div key={i} className="bg-white rounded-lg animate-pulse" style={{animationDelay: `${i * 0.1}s`}}></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Compartilhe assinaturas de forma inteligente
            </h2>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
              Descubra como economizar de forma legal e segura em serviços digitais.
              Cadastre-se e comece a compartilhar.
            </p>
            <Button size="lg" asChild className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-xl px-12 py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all">
              <Link to="/auth">
                CADASTRAR AGORA
              </Link>
            </Button>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-cyan-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Plataforma confiável</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Pagamentos seguros</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 fill-current text-yellow-400" />
                <span>Compartilhamento legal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos - Estilo Vakinha */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Como funciona na prática
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja os benefícios de compartilhar assinaturas de forma organizada
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Economia Real",
                description: "Divida os custos de assinaturas caras entre várias pessoas e pague apenas sua parte proporcional.",
                icon: TrendingUp,
                color: "from-green-500 to-emerald-600"
              },
              {
                title: "Processo Simples",
                description: "Interface intuitiva que facilita a criação de grupos e o gerenciamento de pagamentos.",
                icon: CheckCircle,
                color: "from-blue-500 to-cyan-600"
              },
              {
                title: "Segurança Garantida",
                description: "Sistema seguro de pagamentos e proteção de dados pessoais de todos os participantes.",
                icon: Shield,
                color: "from-purple-500 to-violet-600"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow text-center">
                <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Essencial */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Perguntas frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "É legal compartilhar assinaturas?",
                answer: "Sim! O compartilhamento familiar é permitido pela maioria dos serviços de streaming e assinaturas digitais."
              },
              {
                question: "Como funciona o pagamento?",
                answer: "O pagamento é dividido igualmente entre os membros do grupo. Utilizamos sistemas seguros como PIX e cartão de crédito."
              },
              {
                question: "Posso sair do grupo a qualquer momento?",
                answer: "Sim! Você pode cancelar sua participação a qualquer momento sem multas ou taxas adicionais."
              },
              {
                question: "Como recebo acesso ao serviço?",
                answer: "Após o pagamento, você recebe as credenciais de acesso ou é adicionado ao plano familiar do serviço."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-cyan-300 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Pronto para começar a economizar?
            </h2>
            <p className="text-xl text-cyan-100">
              Descubra a forma mais inteligente de dividir assinaturas e reduzir seus gastos mensais
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-white text-cyan-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl font-semibold">
                <Link to="/auth">
                  Começar gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-2 border-white text-white hover:bg-white hover:text-cyan-600 text-lg px-8 py-6 rounded-xl">
                <Link to="/grupos">
                  <Play className="w-5 h-5 mr-2" />
                  Ver demonstração
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-cyan-100 pt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Cadastro gratuito</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Sem compromisso</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Cancelamento simples</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPreview;
