import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Share2,
  Loader2,
  ChevronDown,
  Info,
  Plus,
  Minus,
  Mail,
  Phone,
  ShoppingCart,
  Gift,
  Rocket,
  Shield,
  Target,
  ArrowLeft,
  ArrowRight,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGroupById, useGroups, formatPrice, formatCategory } from '@/hooks/useGroups';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [joining, setJoining] = useState(false);
  const [kotasQuantity, setKotasQuantity] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'assinatura' | 'proximos' | 'ultimo'>('assinatura');

  const { group, loading, error } = useGroupById(id || '');
  const { groups: allGroups } = useGroups();

  const relatedGroups = allGroups
    .filter(g => g.id !== id && g.service.category === group?.service.category)
    .slice(0, 4);

  const faqs = [
    {
      question: "Quando terei acesso ao serviço ?",
      answer: "O acesso é liberado assim que o pagamento da sua inscrição for confirmado. Se o grupo tiver acesso imediato, você recebe os dados na hora. Caso contrário, o administrador tem até 24h para liberar."
    },
    {
      question: "Quais as formas de pagamento aceitas ?",
      answer: "Aceitamos PIX, cartão de crédito e créditos da sua carteira JuntaPlay. Você pode escolher a melhor forma no momento da inscrição."
    },
    {
      question: "O que é caução?",
      answer: "A caução é um valor de segurança, correspondente a uma mensalidade, que fica retido até você decidir sair do grupo. Ele é devolvido integralmente se você cumprir o aviso prévio de 7 dias."
    },
    {
      question: "Com quem posso dividir uma assinatura?",
      answer: "Com qualquer pessoa! Amigos, família, colegas de trabalho ou até mesmo outros membros da comunidade JuntaPlay. O importante é seguir as regras do grupo."
    }
  ];

  const handleJoinGroup = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setJoining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate(`/join-group/${id}`);
    } catch (error) {
      toast({
        title: "Erro ao entrar no grupo",
        description: "Houve um problema ao processar sua inscrição. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Grupo Não Encontrado</h1>
        <p className="text-gray-600 mb-4">Este grupo não existe mais ou o link está incorreto.</p>
        <Button onClick={() => navigate('/')}>Voltar para o Início</Button>
      </div>
    );
  }

  const availableSpots = group.max_members - group.current_members;
  const totalPrice = group.price_per_slot_cents * 2; // Mensalidade + Caução

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Coluna Esquerda */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Card Principal - Detalhes do Grupo */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {group.service.name} - {group.name}
                  </h1>
                  <p className="text-base text-gray-600 mb-3">Plus</p>
                  <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                    {group.description}
                  </p>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">ASSINADO COM VAGAS</Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">PÚBLICO</Badge>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">FIDELIDADE DE 3 MESES</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-100">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{availableSpots} de {group.max_members}</p>
                      <p className="text-xs text-gray-500">vagas disponíveis</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{formatPrice(group.price_per_slot_cents)}</p>
                      <p className="text-xs text-gray-500">por mês</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-1">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500">acesso por convite</p>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="ml-3">
                  <Share2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
              </div>

            {/* Seção Sobre Fidelidade */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Sobre fidelidade de grupo</h2>
              <p className="text-gray-700 mb-3 text-sm">
                Grupos com Fidelidade oferecem uma experiência exclusiva e vantajosa para os participantes do JuntaPlay. 
                Nessa modalidade, os administradores assumem o compromisso de manter o grupo ativo, enquanto os membros 
                concordam em permanecer no grupo por um período determinado.
              </p>
              <ul className="space-y-2 text-gray-700 mb-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Tanto o administrador quanto os membros do grupo assumem um compromisso mútuo de manter o grupo por um período fixo;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Durante o período de fidelidade, nem os membros e nem o administrador podem cancelar a inscrição ou o grupo, exceto em casos excepcionais, sujeitos ao pagamento de taxas e multas;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Para entender todos os detalhes sobre grupos com fidelidade <a href="#" className="text-blue-600 underline">clique aqui</a>.</span>
                </li>
              </ul>
              
              {/* Alerta de Atenção */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-blue-800 text-sm">Atenção!</p>
                  <p className="text-xs text-blue-700">
                    Este grupo já está ativo. A fidelidade dele será renovada automaticamente em <span className="font-bold">{group.fidelity_months || 3} meses</span>.
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Para mais informações, <a href="#" className="text-blue-600 underline">clique aqui</a>.
                  </p>
                </div>
              </div>
            </div>

            {/* Seção Sobre o Grupo */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Sobre o grupo</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Selos</h3>
                  {group.admin_seals && group.admin_seals.length > 0 ? (
                    <div className="flex gap-2">
                      {group.admin_seals.map((seal, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {seal}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">Este grupo não possui nenhum selo disponível.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Descrição</h3>
                  <div className="text-gray-700 space-y-2 text-sm">
                    {group.description ? (
                      <div dangerouslySetInnerHTML={{ __html: group.description.replace(/\n/g, '<br/>') }} />
                    ) : (
                      <p>O administrador não forneceu nenhuma descrição para este grupo.</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Regrinhas</h3>
                  {group.rules ? (
                    <div className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: group.rules.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <p className="text-gray-600 text-sm">O administrador não forneceu nenhuma regra para este grupo.</p>
                  )}
              </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Outras informações</h3>
                  {group.other_info ? (
                    <p className="text-gray-700 text-sm">
                      <a href={group.other_info} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{group.other_info}</a>
                    </p>
                  ) : (
                    <p className="text-gray-600 text-sm">Nenhuma informação adicional fornecida.</p>
                  )}
            </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Situação</h3>
                  <p className="text-gray-700 text-sm">{group.situation || 'O grupo está ativo e existem vagas disponíveis.'}</p>
                </div>
                </div>
            </div>

            {/* Seção Administrador */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Administrador</h2>
              <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-orange-100 text-orange-600">H</AvatarFallback>
                        </Avatar>
                                <div className="flex-1">
                  <p className="font-semibold text-base">Administrador</p>
                  <div className="flex gap-2 mt-1">
                    {group.admin_seals && group.admin_seals.length > 0 ? (
                      group.admin_seals.map((seal, index) => {
                        const iconMap: { [key: string]: any } = {
                          'rocket': Rocket,
                          'shield': Shield,
                          'target': Target
                        };
                        const IconComponent = iconMap[seal] || Rocket;
                        return <IconComponent key={index} className="h-3 w-3 text-gray-400" />;
                      })
                    ) : (
                      <>
                        <Rocket className="h-3 w-3 text-gray-400" />
                        <Shield className="h-3 w-3 text-gray-400" />
                        <Target className="h-3 w-3 text-gray-400" />
                      </>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Ligar
                    </Button>
                  </div>
                        </div>
                    </div>
                </div>

            {/* Seção Quem faz parte */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Quem faz parte</h2>
                     {group.group_memberships && group.group_memberships.length > 0 ? (
                       <div className="space-y-2">
                         {group.group_memberships.map((membership, index) => (
                           <div key={membership.id} className="flex items-center gap-3">
                             <Avatar className="h-8 w-8">
                               <AvatarImage src="/placeholder.svg" />
                               <AvatarFallback className="bg-blue-100 text-blue-600">
                                 {membership.user_id.charAt(0).toUpperCase()}
                               </AvatarFallback>
                                </Avatar>
                             <span className="font-medium text-sm">Membro {index + 1}</span>
                           </div>
                            ))}
                        </div>
                    ) : (
                       <p className="text-gray-600 text-sm">Seja o primeiro a entrar!</p>
                    )}
                </div>

            {/* Seção Dúvidas Frequentes */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Dúvidas frequentes</h2>
              <div className="space-y-1">
                {faqs.map((faq, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-left hover:bg-gray-50 rounded-lg px-2 transition-colors">
                      <span className="font-medium text-sm">{faq.question}</span>
                      <Plus className="h-3 w-3 text-gray-500" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 pb-2">
                      <p className="text-gray-600 text-xs leading-relaxed">{faq.answer}</p>
                    </CollapsibleContent>
                </Collapsible>
                ))}
              </div>
            </div>
            
            {/* Seção Você também pode gostar */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Você também pode gostar</h2>
                <Link to="/groups" className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                  Ver Tudo
                </Link>
                </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {relatedGroups.slice(0, 4).map((group) => {
                      const availableSpots = group.max_members - group.current_members;
                      const getServiceInitial = (name: string) => name.charAt(0).toUpperCase();
                      
                      return (
                        <Card key={group.id} className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                          <Link to={`/group/${group.id}`}>
                        <CardContent className="p-3 text-center space-y-2">
                          <div className="w-10 h-10 mx-auto bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {getServiceInitial(group.service.name)}
                              </div>
                          <h3 className="font-semibold text-gray-900 text-xs line-clamp-2">{group.service.name}</h3>
                          <p className="text-xs text-gray-600 font-medium">{group.max_members} Vagas</p>
                          <p className="text-base font-bold text-gray-900">{formatPrice(group.price_per_slot_cents)}</p>
                          <p className="text-xs text-gray-500">{availableSpots > 0 ? 'Assinado, com vagas' : 'Grupo completo'}</p>
                            </CardContent>
                          </Link>
                        </Card>
                      );
                    })}
                </div>
            </div>
          </div>

          {/* Coluna Direita (Sidebar) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-24">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 text-sm">Mensalidade</p>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(group.price_per_slot_cents)}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 text-sm">JuntaPlay</p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => setKotasQuantity(Math.max(1, kotasQuantity - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-medium text-sm">{kotasQuantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => setKotasQuantity(kotasQuantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 text-sm">Fidelidade</p>
                  <p className="text-gray-900 text-sm">{group.fidelity_months || 3} meses</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 text-sm">Caução</p>
                  <p className="text-lg font-bold text-gray-900">{formatPrice(group.price_per_slot_cents)}</p>
                </div>
                
                <Separator className="my-3"/>
                
                <div className="flex justify-between items-center font-bold text-base">
                  <p className="text-gray-900">Total da inscrição</p>
                  <p className="text-gray-900">
                    {selectedPlan === 'assinatura' ? formatPrice(totalPrice) : 
                     selectedPlan === 'proximos' ? formatPrice(group.price_per_slot_cents) : 
                     'Grátis'}
                  </p>
                </div>
                
                                {/* Price Breakdown Slider */}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Assinatura</span>
                    <span className="text-xs text-gray-600">Próximos meses</span>
                    <span className="text-xs text-gray-600">Último mês</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div className={`absolute top-0 left-0 h-2 rounded-full w-1/3 transition-colors ${selectedPlan === 'assinatura' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute top-0 left-1/3 h-2 rounded-full w-1/3 transition-colors ${selectedPlan === 'proximos' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute top-0 left-2/3 h-2 rounded-full w-1/3 transition-colors ${selectedPlan === 'ultimo' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-center cursor-pointer" onClick={() => setSelectedPlan('assinatura')}>
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${selectedPlan === 'assinatura' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <p className="text-xs text-gray-500 line-through">{formatPrice(totalPrice)}</p>
                      <p className="text-xs font-medium">{formatPrice(group.price_per_slot_cents)}</p>
              </div>
                    <div className="text-center cursor-pointer" onClick={() => setSelectedPlan('proximos')}>
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${selectedPlan === 'proximos' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <p className="text-xs font-medium text-gray-900">{formatPrice(group.price_per_slot_cents)}</p>
              </div>
                    <div className="text-center cursor-pointer" onClick={() => setSelectedPlan('ultimo')}>
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${selectedPlan === 'ultimo' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                      <p className="text-xs font-medium text-green-600">Grátis</p>
              </div>
              </div>
              </div>
                
              <Button 
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                  onClick={handleJoinGroup}
                disabled={joining || availableSpots <= 0}
              >
                {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Participar'}
              </Button>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GroupDetails;
