import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronLeft, HelpCircle, Users, CreditCard, Shield, Star, MessageCircle, Mail, Settings, UserCheck, FileText, Phone, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Ajuda = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('novo');

  // Seções principais baseadas no Kotas
  const mainSections = [
    {
      id: 'novo',
      title: 'Novo no JuntaPlay?',
      description: 'Comece por aqui! Aqui nós te damos os primeiros passos com tudo que precisa saber sobre o JuntaPlay.',
      icon: <Star className="h-6 w-6" />,
      color: "bg-cyan-500"
    },
    {
      id: 'grupos',
      title: 'Grupos',
      description: 'Entenda melhor sobre como funcionam os grupos e como resolver problemas, caso tenha.',
      icon: <Users className="h-6 w-6" />,
      color: "bg-cyan-500"
    },
    {
      id: 'pagamentos',
      title: 'Pagamentos',
      description: 'Tem alguma dúvida sobre pagamentos? Sem problemas, te damos uma mãozinha.',
      icon: <CreditCard className="h-6 w-6" />,
      color: "bg-cyan-500"
    },
    {
      id: 'creditos',
      title: 'Créditos',
      description: 'Como funcionam os créditos? Clique aqui para entender melhor sobre o assunto.',
      icon: <Shield className="h-6 w-6" />,
      color: "bg-cyan-500"
    }
  ];

  // FAQ por seção
  const faqBySection = {
    servicos: [
      {
        question: "Quando terei acesso ao serviço?",
        answer: "O acesso ao serviço é liberado imediatamente após a confirmação do pagamento. Para grupos, o acesso é liberado assim que o grupo atingir o número mínimo de participantes e o pagamento for confirmado."
      },
      {
        question: "Como ativar a autenticação em dois fatores?",
        answer: "A autenticação em dois fatores pode ser ativada nas configurações do seu perfil. Recomendamos fortemente ativar esta funcionalidade para maior segurança da sua conta."
      },
      {
        question: "Com quem posso compartilhar minha assinatura?",
        answer: "Você pode compartilhar sua assinatura com pessoas de confiança através dos grupos. Lembre-se de sempre usar senhas diferentes das suas contas principais para maior segurança."
      },
      {
        question: "Como pagar minhas faturas automaticamente?",
        answer: "Você pode configurar pagamentos automáticos através do seu perfil. Basta adicionar um método de pagamento e ativar a opção de renovação automática."
      }
    ],
    grupos: [
      {
        question: "Tive um problema no meu grupo, como faço para resolver?",
        answer: "Para problemas no grupo, primeiro tente entrar em contato com o administrador do grupo. Se não conseguir resolver, entre em contato conosco através do chat ou e-mail de suporte."
      },
      {
        question: "O que significam os status dos grupos?",
        answer: "Os grupos podem ter diferentes status: 'Aberto' (aceitando participantes), 'Cheio' (não há mais vagas), 'Em andamento' (ativo e funcionando), 'Finalizado' (encerrado) e 'Cancelado' (cancelado pelo administrador)."
      },
      {
        question: "Como inscrever-se em um grupo?",
        answer: "Navegue até 'Todos os Grupos', encontre um grupo disponível, clique nele e depois em 'Participar'. Você precisará ter créditos suficientes na sua conta."
      },
      {
        question: "Me inscrevi em um grupo mas ao finalizar ele estava cheio.",
        answer: "Isso pode acontecer quando várias pessoas tentam participar simultaneamente. Os créditos são devolvidos automaticamente. Tente participar de outro grupo ou crie o seu próprio."
      },
      {
        question: "Critérios de aprovação de grupos públicos vs. grupos privados.",
        answer: "Grupos públicos são aprovados automaticamente após verificação básica. Grupos privados requerem aprovação manual e podem ter critérios específicos definidos pelo administrador."
      }
    ],
    contato: [
      {
        question: "Como entrar em contato com o administrador do grupo?",
        answer: "Você pode entrar em contato com o administrador através do chat interno do grupo ou através das informações de contato fornecidas na página do grupo."
      },
      {
        question: "Como entrar em contato com o JuntaPlay?",
        answer: "Você pode entrar em contato conosco através do chat online, e-mail (suporte@juntaplay.com) ou através do formulário de contato na seção de ajuda."
      },
      {
        question: "Como enviar os dados de acesso.",
        answer: "Os dados de acesso são compartilhados automaticamente através da plataforma quando você participa de um grupo. Nunca compartilhe credenciais por e-mail ou mensagens externas."
      }
    ]
  };

  // Artigos recentes
  const recentArticles = [
    {
      title: "Como programar um Pix para adicionar créditos no JuntaPlay",
      description: "Aprenda a configurar pagamentos automáticos via Pix para manter seus créditos sempre atualizados.",
      date: "2024-01-15"
    },
    {
      title: "Termos e Condições do Programa de Indicação do JuntaPlay",
      description: "Conheça as regras e benefícios do nosso programa de indicação.",
      date: "2024-01-10"
    },
    {
      title: "Termos de Uso para Grupos com Fidelidade",
      description: "Entenda as regras específicas para grupos que oferecem benefícios de fidelidade.",
      date: "2024-01-08"
    },
    {
      title: "Cancelamento em Grupos com Fidelidade",
      description: "Saiba como funciona o processo de cancelamento em grupos com fidelidade.",
      date: "2024-01-05"
    },
    {
      title: "Como funciona Grupos com Fidelidade?",
      description: "Entenda o conceito e benefícios dos grupos com programa de fidelidade.",
      date: "2024-01-03"
    }
  ];

  const quickActions = [
    {
      title: "Criar Grupo",
      description: "Comece a economizar criando seu próprio grupo",
      icon: <Users className="h-6 w-6" />,
      action: () => navigate('/create-group'),
      color: "bg-cyan-500"
    },
    {
      title: "Meus Créditos",
      description: "Gerencie seus créditos e transações",
      icon: <CreditCard className="h-6 w-6" />,
      action: () => navigate('/creditos'),
      color: "bg-cyan-500"
    },
    {
      title: "Meus Grupos",
      description: "Veja todos os seus grupos",
      icon: <Users className="h-6 w-6" />,
      action: () => navigate('/my-groups'),
      color: "bg-cyan-500"
    },
    {
      title: "Todos os Grupos",
      description: "Encontre grupos para participar",
      icon: <Star className="h-6 w-6" />,
      action: () => navigate('/groups'),
      color: "bg-cyan-500"
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'novo':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-50 to-cyan-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Bem-vindo ao JuntaPlay!</h3>
              <p className="text-gray-700 mb-4">
                O JuntaPlay é a plataforma que te ajuda a economizar dividindo custos de assinaturas 
                com outras pessoas. Aqui está tudo que você precisa saber para começar:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-600" />
                    Passo 1: Criar ou Participar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Você pode criar seu próprio grupo ou participar de grupos existentes. 
                    Grupos criados por você te dão controle total sobre as configurações.
                  </p>
                  <Button onClick={() => navigate('/create-group')} className="w-full">
                    Criar Meu Primeiro Grupo
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-cyan-600" />
                    Passo 2: Adicionar Créditos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Os créditos são a moeda da plataforma. Adicione créditos através de 
                    pagamentos para poder participar de grupos.
                  </p>
                  <Button onClick={() => navigate('/creditos')} className="w-full">
                    Adicionar Créditos
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cyan-600" />
                    Passo 3: Compartilhar com Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Use senhas diferentes das suas contas principais. A plataforma 
                    facilita o compartilhamento seguro de credenciais.
                  </p>
                  <div className="text-sm text-gray-500">
                    💡 Dica: Sempre use senhas únicas para contas compartilhadas
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-cyan-600" />
                    Passo 4: Economizar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Divida custos de assinaturas e economize significativamente. 
                    Alguns usuários economizam até 80% dos custos originais.
                  </p>
                  <div className="text-sm text-gray-500">
                    💰 Exemplo: Netflix por R$ 5 em vez de R$ 25
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'grupos':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Como Funcionam os Grupos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-cyan-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Grupos Públicos</h4>
                    <p className="text-sm text-gray-600">
                      Visíveis para todos, aprovados automaticamente
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="h-6 w-6 text-cyan-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Grupos Privados</h4>
                    <p className="text-sm text-gray-600">
                      Acesso controlado, aprovação manual
                    </p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="h-6 w-6 text-cyan-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Grupos com Fidelidade</h4>
                    <p className="text-sm text-gray-600">
                      Benefícios especiais para participantes recorrentes
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {faqBySection.grupos.map((item, index) => (
                    <AccordionItem key={index} value={`grupo-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        );

      case 'pagamentos':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Formas de Pagamento Aceitas</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                        <span>Pix (instantâneo)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                        <span>Cartão de Crédito</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                        <span>Cartão de Débito</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                        <span>Boleto Bancário</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Informações Importantes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-cyan-600 mt-0.5" />
                        <span>Pagamentos são processados imediatamente</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-cyan-600 mt-0.5" />
                        <span>Créditos são adicionados automaticamente</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-cyan-600 mt-0.5" />
                        <span>Reembolsos são processados em até 5 dias úteis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurar Pagamentos Automáticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Configure pagamentos automáticos para nunca ficar sem créditos:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-600 font-semibold">1</span>
                      </div>
                      <span>Acesse as configurações do seu perfil</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-600 font-semibold">2</span>
                      </div>
                      <span>Adicione um método de pagamento</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-600 font-semibold">3</span>
                      </div>
                      <span>Configure o valor e frequência dos pagamentos</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-cyan-600 font-semibold">4</span>
                      </div>
                      <span>Ative a renovação automática</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'creditos':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Como Funcionam os Créditos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-cyan-50 to-cyan-50 p-6 rounded-lg">
                    <h4 className="font-semibold mb-3">O que são Créditos?</h4>
                    <p className="text-gray-700">
                      Créditos são a moeda virtual do JuntaPlay. Você pode adicionar créditos através de 
                      pagamentos e usá-los para participar de grupos. Quando alguém participa do seu grupo, 
                      você recebe créditos automaticamente.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Como Ganhar Créditos</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-cyan-600" />
                          <span>Adicionando dinheiro via pagamentos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-cyan-600" />
                          <span>Quando pessoas participam dos seus grupos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-cyan-600" />
                          <span>Programa de indicação</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-cyan-600" />
                          <span>Promoções e bônus</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Como Usar Créditos</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Participar de grupos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Criar grupos (gratuito)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Transferir para outros usuários</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Sacar para sua conta bancária</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Seus Créditos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Acesse a seção "Meus Créditos" para:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={() => navigate('/creditos')}
                    >
                      <CreditCard className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Ver Saldo</div>
                        <div className="text-xs text-gray-500">Consulte seu saldo atual</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={() => navigate('/adicionar-creditos')}
                    >
                      <CreditCard className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Adicionar Créditos</div>
                        <div className="text-xs text-gray-500">Faça um pagamento</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={() => navigate('/sacar-creditos')}
                    >
                      <CreditCard className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Sacar Créditos</div>
                        <div className="text-xs text-gray-500">Transfira para sua conta</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-4"
                      onClick={() => navigate('/detalhes-transacao')}
                    >
                      <FileText className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">Histórico</div>
                        <div className="text-xs text-gray-500">Veja suas transações</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 p-0 h-auto text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Central de Ajuda</h1>
          <p className="text-gray-600">Encontre respostas para suas dúvidas e aprenda como usar o JuntaPlay</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Seções Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {mainSections.map((section) => (
                <Card 
                  key={section.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    activeSection === section.id ? 'ring-2 ring-cyan-500' : ''
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center`}>
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Conteúdo da Seção Ativa */}
            {renderSectionContent()}

            {/* FAQ Geral */}
            <Card>
              <CardHeader>
                <CardTitle>Dúvidas Frequentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Serviços e configurações
                    </h4>
                    <Accordion type="single" collapsible className="w-full">
                      {faqBySection.servicos.map((item, index) => (
                        <AccordionItem key={index} value={`servico-${index}`}>
                          <AccordionTrigger className="text-left text-sm">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-600 text-sm">{item.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Contato
                    </h4>
                    <Accordion type="single" collapsible className="w-full">
                      {faqBySection.contato.map((item, index) => (
                        <AccordionItem key={index} value={`contato-${index}`}>
                          <AccordionTrigger className="text-left text-sm">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-gray-600 text-sm">{item.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Últimos Artigos */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Artigos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentArticles.map((article, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <h4 className="font-medium mb-2">{article.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(article.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={action.action}
                  >
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Precisa de Ajuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <MessageCircle className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium">Chat Online</p>
                    <p className="text-sm text-gray-600">Fale com nosso suporte</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Mail className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium">E-mail</p>
                    <p className="text-sm text-gray-600">suporte@juntaplay.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Phone className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="font-medium">Telefone</p>
                    <p className="text-sm text-gray-600">(11) 99999-9999</p>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('mailto:suporte@juntaplay.com', '_blank')}
                  >
                    Enviar E-mail
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Dicas Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    Sempre use senhas diferentes para contas compartilhadas
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    Mantenha seus dados de pagamento atualizados
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    Verifique as regras do grupo antes de participar
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    Reporte problemas através do chat ou e-mail
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-cyan-600">•</span>
                    Configure pagamentos automáticos para não ficar sem créditos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Ajuda; 