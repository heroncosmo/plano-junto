import { useState, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  AlertTriangle,
  Trash2,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGroupById, useGroups, formatPrice, formatCategory } from '@/hooks/useGroups';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { CancellationModal } from '@/components/CancellationModal';
import { useComplaintCheck } from '@/hooks/useComplaintCheck';

// Interface para dados dos membros
interface MemberData {
  id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    full_name: string;
    phone: string;
    user_id: string;
  };
}

// Interface para dados do administrador
interface AdminData {
  id: string;
  full_name: string;
  phone: string;
  user_id: string;
  email?: string;
}

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const [joining, setJoining] = useState(false);
  const [kotasQuantity, setKotasQuantity] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<'assinatura' | 'proximos' | 'ultimo'>('assinatura');

  const [groupData, setGroupData] = useState<any>(null);
  const [membersData, setMembersData] = useState<MemberData[]>([]);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<{name: string, email?: string, phone?: string} | null>(null);
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [userMembership, setUserMembership] = useState<any>(null);
  
  // Estados para as funcionalidades de admin
  const [showChangeValueDialog, setShowChangeValueDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelReasonDialog, setShowCancelReasonDialog] = useState(false);
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDescription, setCancelDescription] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [showAccessDataDialog, setShowAccessDataDialog] = useState(false);

  const { group, loading, error, refetch } = useGroupById(id || '');
  const { groups: allGroups } = useGroups();
  const { hasActiveComplaint, complaintId, complaintStatus, loading: complaintCheckLoading } = useComplaintCheck(id || '');

  // Carregar dados completos do grupo incluindo campos de aprovação
  useEffect(() => {
    const loadCompleteGroupData = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('groups')
          .select(`
            id,
            name,
            description,
            admin_id,
            service_id,
            price_per_slot_cents,
            max_members,
            current_members,
            status,
            admin_approved,
            owner_approved,
            created_at,
            updated_at,
            services:service_id (
              name,
              icon_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setGroupData(data);
      } catch (error) {
        console.error('Erro ao carregar dados completos do grupo:', error);
      }
    };

    loadCompleteGroupData();
  }, [id]);

  // Carregar dados dos membros do grupo
  useEffect(() => {
    const loadMembersData = async () => {
      if (!id) return;

      try {
        // Primeiro buscar os membros do grupo
        const { data: memberships, error: membershipsError } = await supabase
          .from('group_memberships')
          .select('id, user_id, joined_at')
          .eq('group_id', id)
          .eq('status', 'active');

        if (membershipsError) throw membershipsError;

        // Depois buscar os perfis dos membros
        if (memberships && memberships.length > 0) {
          const userIds = memberships.map(m => m.user_id);
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, full_name, phone')
            .in('user_id', userIds);

          if (profilesError) throw profilesError;

          // Combinar os dados
          const membersWithProfiles = memberships.map(membership => {
            const profile = profiles?.find(p => p.user_id === membership.user_id);
            return {
              ...membership,
              profile
            };
          });

          setMembersData(membersWithProfiles);
        } else {
          setMembersData([]);
        }
      } catch (error) {
        console.error('Erro ao carregar dados dos membros:', error);
        setMembersData([]);
      }
    };

    loadMembersData();
  }, [id]);

  // Carregar dados do administrador
  useEffect(() => {
    const loadAdminData = async () => {
              if (!groupData?.admin_id) {
          return;
        }

      try {
        // Buscar o perfil do administrador (incluindo email)
        const { data: adminProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, phone, user_id, email')
          .eq('user_id', groupData.admin_id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // Usar o email diretamente do perfil (se disponível)
        setAdminData({
          ...adminProfile,
          email: adminProfile.email || ''
        });
              } catch (error) {
          // Silenciar erro para não quebrar a interface
        }
    };

    loadAdminData();
  }, [groupData?.admin_id, user]);

  // Verificar se o usuário é membro do grupo
  useEffect(() => {
    const checkUserMembership = async () => {
      if (!id || !user?.id) return;

      try {
        const { data: membership, error } = await supabase
          .from('group_memberships')
          .select('*')
          .eq('group_id', id)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar participação:', error);
          return;
        }

        setIsGroupMember(!!membership);
        setUserMembership(membership);
      } catch (error) {
        console.error('Erro ao verificar participação:', error);
      }
    };

    checkUserMembership();
  }, [id, user?.id]);

  // Recarregar dados quando a página for focada novamente
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  // Função para mostrar dados de contato
  const handleShowContact = (contact: {name: string, email?: string, phone?: string}) => {
    setSelectedContact(contact);
    setShowContactDialog(true);
  };

  // Função para copiar dados de contato
  const handleCopyContact = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copiado!`,
      description: `${type} foi copiado para a área de transferência.`,
    });
  };

  // Função para mostrar dados de acesso
  const handleShowAccessData = () => {
    setShowAccessDataDialog(true);
  };

  // Função para cancelar participação
  const handleCancelParticipation = () => {
    if (userMembership) {
      navigate(`/grupo/membro/${userMembership.id}/cancelamento/informacoes`);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível identificar sua participação no grupo.",
        variant: "destructive",
      });
    }
  };

  // Função para abrir reclamação
  const handleOpenComplaint = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (hasActiveComplaint && complaintId) {
      // Se já tem reclamação ativa, navegar para ver a reclamação
      navigate(`/ver-reclamacao/${complaintId}`);
    } else {
      // Se não tem reclamação, navegar para criar nova com timestamp
      const timestamp = Date.now();
      navigate(`/reclamacao/inicial?groupId=${id}&t=${timestamp}`);
    }
  };

  const relatedGroups = allGroups
    .filter(g => g.id !== id && g.services?.category === group?.services?.category)
    .slice(0, 4);

  // Verificar se o usuário é o admin do grupo
  const isGroupAdmin = groupData && user && groupData.admin_id === user.id;

  // Verificar se o grupo precisa ser liberado
  const needsOwnerApproval = groupData && groupData.admin_approved && !groupData.owner_approved;
  
  // Verificar se o grupo tem membros
  const hasMembers = groupData && groupData.group_memberships && groupData.group_memberships.length > 0;
  
  // Verificar se o grupo ainda não foi aprovado
  const isNotApproved = groupData && !groupData.admin_approved;

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

    // Evitar múltiplas chamadas
    if (joining) {
      return;
    }

    setJoining(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Criar notificação de inscrição no grupo
      await createNotification(
        'Inscrição realizada com sucesso!',
        `Você se inscreveu no grupo "${group?.name}". Acesse seus grupos para acompanhar.`,
        'success',
        'group',
        true,
        '/my-groups',
        'Ver meus grupos'
      );
      
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

  // Funções para ações do admin
  const handleChangeValue = () => {
    if (hasMembers) {
      // Se tem membros, mostra modal de contato com suporte
      setShowChangeValueDialog(true);
    } else {
      // Se não tem membros, permite alterar diretamente
      navigate(`/group/${id}/change-value`);
    }
  };

  const handleCancelGroup = () => {
    setShowCancelDialog(true);
  };

  const handleCancelReason = () => {
    setShowCancelDialog(false);
    setShowCancelReasonDialog(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelReasonDialog(false);
    setShowCancelConfirmDialog(true);
  };

  const handleFinalCancel = async () => {
    setIsProcessingAction(true);
    try {
      // Simular cancelamento do grupo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Grupo encerrado",
        description: "O grupo foi encerrado com sucesso.",
      });
      
      navigate('/my-groups');
    } catch (error) {
      toast({
        title: "Erro ao encerrar grupo",
        description: "Houve um problema ao encerrar o grupo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
      setShowCancelConfirmDialog(false);
    }
  };

  const handleValueChangeSuccess = () => {
    toast({
      title: "Valor alterado",
      description: "O valor do grupo foi alterado com sucesso.",
    });
    setShowChangeValueDialog(false);
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
                    {group.services?.name || 'Serviço não disponível'} - {group.name}
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

            {/* Seção de Parabéns - Só aparece para membros do grupo */}
            {isGroupMember && (
              <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Gift className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-cyan-900 mb-2">
                      Parabéns, seu grupo está Ativo!
                    </h3>
                    <p className="text-cyan-700 text-sm mb-4">
                      As informações de acesso foram fornecidas pelo administrador do grupo. 
                      Certifique que o acesso esteja funcional e tenha uma boa diversão.
                    </p>
                    <Button
                      onClick={handleShowAccessData}
                      className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
                    >
                      Ver dados de acesso
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Seção Sobre Fidelidade - Só aparece para não membros */}
            {!isGroupMember && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="text-base font-semibold mb-3">Sobre fidelidade de grupo</h2>
                <p className="text-gray-700 mb-3 text-sm">
                  Grupos com Fidelidade oferecem uma experiência exclusiva e vantajosa para os participantes do JuntaPlay. 
                  Nessa modalidade, os administradores assumem o compromisso de manter o grupo ativo, enquanto os membros 
                  concordam em permanecer no grupo por um período determinado.
                </p>
                <ul className="space-y-2 text-gray-700 mb-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>Tanto o administrador quanto os membros do grupo assumem um compromisso mútuo de manter o grupo por um período fixo;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>Durante o período de fidelidade, nem os membros e nem o administrador podem cancelar a inscrição ou o grupo, exceto em casos excepcionais, sujeitos ao pagamento de taxas e multas;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-1">•</span>
                    <span>Para entender todos os detalhes sobre grupos com fidelidade <a href="#" className="text-cyan-600 underline">clique aqui</a>.</span>
                  </li>
                </ul>
                
                {/* Alerta de Atenção */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 flex items-start gap-3">
                  <Info className="h-4 w-4 text-cyan-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-cyan-800 text-sm">Atenção!</p>
                    <p className="text-xs text-cyan-700">
                      Este grupo já está ativo. A fidelidade dele será renovada automaticamente em <span className="font-bold">{group.fidelity_months || 3} meses</span>.
                    </p>
                    <p className="text-xs text-cyan-700 mt-1">
                      Para mais informações, <a href="#" className="text-cyan-600 underline">clique aqui</a>.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                      <a href={group.other_info} className="text-cyan-600 underline" target="_blank" rel="noopener noreferrer">{group.other_info}</a>
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

            {/* Seção de Instruções - Só aparece para o admin do grupo */}
            {isGroupAdmin && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="text-base font-semibold mb-3">Instruções importantes</h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Não compartilhe a senha com ninguém fora deste grupo de assinatura</p>
                  <p>• Não utilize esta conta compartilhada para postar em meu nome do administrador</p>
                  <p>• Não altere a senha do grupo</p>
                </div>
              </div>
            )}

            {/* Próximos passos - Só aparece para o admin quando o grupo foi aprovado mas não liberado */}
            {isGroupAdmin && groupData && groupData.admin_approved && !groupData.owner_approved && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-semibold mb-3">Próximos passos</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm text-gray-900">
                      Seu grupo foi criado
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm text-gray-900">
                      Seu grupo está em análise de aprovação
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm text-gray-900">
                      Grupo foi aprovado. Necessário liberá-lo para receber membros.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-sm text-gray-900">
                      Liberar grupo para receber membros.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Liberação do Grupo - Só aparece para o admin do grupo */}
            {isGroupAdmin && needsOwnerApproval && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-gray-900">Libere seu grupo agora mesmo</h3>
                    <p className="text-xs text-gray-600">Seu grupo foi aprovado. Agora você precisa liberá-lo para que comece a receber membros.</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/grupo/${id}/gerenciar`)}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-sm"
                  size="default"
                >
                  Liberar grupo
                </Button>
              </div>
            )}

            {/* Próximos passos - Só aparece para o admin quando o grupo não foi aprovado ainda */}
            {isGroupAdmin && groupData && !groupData.admin_approved && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="text-base font-semibold mb-3">Próximos passos</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm text-gray-900">
                      Seu grupo foi criado
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-900">
                      Seu grupo está em análise de aprovação
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-900">
                      Grupo foi aprovado. Necessário liberá-lo para receber membros.
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm text-gray-900">
                      Liberar grupo para receber membros.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Seção Administrador */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Administrador</h2>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/juntaplay-logo.svg" />
                  <AvatarFallback className="bg-cyan-100 text-cyan-600">
                    {adminData?.full_name ? adminData.full_name.charAt(0).toUpperCase() : 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-base">
                    {adminData?.full_name || 'Administrador'}
                  </p>
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
                  {isGroupMember && (
                    <div className="flex gap-3 mt-2">
                      {adminData?.phone && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs hover:bg-cyan-50"
                          onClick={() => {
                            handleShowContact({
                              name: adminData?.full_name || 'Administrador',
                              phone: adminData.phone
                            });
                          }}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Ligar
                        </Button>
                      )}
                      {adminData?.email && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs hover:bg-cyan-50"
                          onClick={() => {
                            handleShowContact({
                              name: adminData?.full_name || 'Administrador',
                              email: adminData.email
                            });
                          }}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seção Quem faz parte */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="text-base font-semibold mb-3">Quem faz parte</h2>
              {membersData.length > 0 ? (
                <div className="space-y-2">
                  {membersData.map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/juntaplay-logo.svg" />
                          <AvatarFallback className="bg-cyan-100 text-cyan-600">
                            {member.profile?.full_name ? member.profile.full_name.charAt(0).toUpperCase() : 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {member.profile?.full_name || `Membro ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {member.profile?.phone && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2 text-xs hover:bg-cyan-50"
                            onClick={() => handleShowContact({
                              name: member.profile?.full_name || `Membro ${index + 1}`,
                              phone: member.profile.phone
                            })}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Seja o primeiro a entrar!</p>
              )}
            </div>

            {/* Seção Sua participação - Só aparece para membros */}
            {isGroupMember && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="text-base font-semibold mb-3">Sua participação</h2>
                <p className="text-gray-700 text-sm">
                  Você possui 1 kota neste grupo.
                </p>
              </div>
            )}

            {/* Seção Ações - Só aparece para membros */}
            {isGroupMember && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="text-base font-semibold mb-3">Ações</h2>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left text-sm"
                    onClick={handleOpenComplaint}
                    disabled={complaintCheckLoading}
                  >
                    <span>
                      {complaintCheckLoading 
                        ? 'Verificando...' 
                        : hasActiveComplaint 
                          ? 'Ver reclamação aberta' 
                          : 'Abrir uma reclamação'
                      }
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left text-sm text-red-600 hover:text-red-700"
                    onClick={handleCancelParticipation}
                  >
                    <span>Cancelar minha participação</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            )}

            {/* Seção Mais opções - Só aparece para o admin do grupo */}
            {isGroupAdmin && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h2 className="text-base font-semibold mb-3">Mais opções</h2>
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left text-sm"
                    onClick={handleCancelGroup}
                  >
                    <span>Encerrar grupo</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-left text-sm"
                    onClick={handleChangeValue}
                  >
                    <span>Alterar valor do grupo</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            )}

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
                <Link to="/groups" className="text-cyan-600 hover:text-cyan-700 text-xs font-medium">
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
                                                      <div className="w-10 h-10 mx-auto bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {getServiceInitial(group.services?.name || 'S')}
                            </div>
                            <h3 className="font-semibold text-gray-900 text-xs line-clamp-2">{group.services?.name || 'Serviço não disponível'}</h3>
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
                                    <div className={`absolute top-0 left-0 h-2 rounded-full w-1/3 transition-colors ${selectedPlan === 'assinatura' ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute top-0 left-1/3 h-2 rounded-full w-1/3 transition-colors ${selectedPlan === 'proximos' ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute top-0 left-2/3 h-2 rounded-full w-1/3 transition-colors ${selectedPlan === 'ultimo' ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
              </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-center cursor-pointer" onClick={() => setSelectedPlan('assinatura')}>
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${selectedPlan === 'assinatura' ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                      <p className="text-xs text-gray-500 line-through">{formatPrice(totalPrice)}</p>
                      <p className="text-xs font-medium">{formatPrice(group.price_per_slot_cents)}</p>
              </div>
                    <div className="text-center cursor-pointer" onClick={() => setSelectedPlan('proximos')}>
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${selectedPlan === 'proximos' ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                      <p className="text-xs font-medium text-gray-900">{formatPrice(group.price_per_slot_cents)}</p>
              </div>
                    <div className="text-center cursor-pointer" onClick={() => setSelectedPlan('ultimo')}>
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${selectedPlan === 'ultimo' ? 'bg-cyan-500' : 'bg-gray-300'}`}></div>
                      <p className="text-xs font-medium text-cyan-600">Grátis</p>
              </div>
              </div>
              </div>
                
              {!isGroupMember ? (
                <Button 
                  className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg"
                  onClick={handleJoinGroup}
                  disabled={joining || availableSpots <= 0}
                >
                  {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Participar'}
                </Button>
              ) : (
                <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <div className="flex items-center gap-2 text-cyan-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Você já participa deste grupo</span>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />

      {/* Modal de Alteração de Valor - Quando tem membros */}
      <Dialog open={showChangeValueDialog} onOpenChange={setShowChangeValueDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-cyan-500" />
              Ops! Alteração do Valor de Grupo Indisponível
            </DialogTitle>
            <DialogDescription>
              Para realizar o ajuste do valor, entre em contato com o suporte preenchendo o formulário com as informações:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">ID do grupo:</span>
                <span className="text-sm font-medium">{id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Valor total do grupo atualmente:</span>
                <span className="text-sm font-medium">{formatPrice(group.price_per_slot_cents)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Qual o novo valor deseja para o grupo?</span>
                <span className="text-sm text-gray-500">(Exemplo: R$ 59,90)</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
                              * Não se esqueça de anexar o <a href="#" className="text-cyan-600 underline">comprovante de reajuste do serviço</a>.
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setShowChangeValueDialog(false)}>
                Entrar em contato com o suporte
              </Button>
              <Button variant="outline" onClick={() => setShowChangeValueDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Aviso Importante - Cancelamento */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aviso Importante!</DialogTitle>
            <DialogDescription>
              Antes de prosseguir com seu cancelamento precisamos que você saiba sobre algumas informações importantes:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Trash2 className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600">
                Ao encerrar o grupo, todos os membros serão notificados e o grupo será desativado permanentemente.
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCancelReason}>
                Prosseguir
              </Button>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Voltar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Motivo do Cancelamento */}
      <Dialog open={showCancelReasonDialog} onOpenChange={setShowCancelReasonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Por que está partindo?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_usar" id="nao_usar" />
                  <Label htmlFor="nao_usar" className="text-sm">Não irei mais utilizar o serviço</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="economia" id="economia" />
                  <Label htmlFor="economia" className="text-sm">A grana ta curta, vou dar uma economizada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cartao" id="cartao" />
                  <Label htmlFor="cartao" className="text-sm">Problemas com meu cartão de crédito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="demora" id="demora" />
                  <Label htmlFor="demora" className="text-sm">Muita demora para completar o grupo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outro_grupo" id="outro_grupo" />
                  <Label htmlFor="outro_grupo" className="text-sm">Vou criar outro grupo.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outros" id="outros" />
                  <Label htmlFor="outros" className="text-sm">Outros</Label>
                </div>
              </div>
            </RadioGroup>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">
                Conte para gente um pouco mais do que te levou a cancelar sua participação.
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva o motivo..."
                value={cancelDescription}
                onChange={(e) => setCancelDescription(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleCancelConfirm}
                disabled={!cancelReason}
              >
                Continuar
              </Button>
              <Button variant="outline" onClick={() => setShowCancelReasonDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação Final */}
      <Dialog open={showCancelConfirmDialog} onOpenChange={setShowCancelConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quando deseja cancelar do grupo?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                <div>
                  <p className="text-sm font-medium">Imediatamente</p>
                  <p className="text-xs text-gray-600">Cancelar grupo agora mesmo</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700" 
                onClick={handleFinalCancel}
                disabled={isProcessingAction}
              >
                {isProcessingAction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Encerrando...
                  </>
                ) : (
                  'Encerrar grupo'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCancelConfirmDialog(false)}>
                Voltar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Contato */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                              <Info className="h-5 w-5 text-cyan-600" />
              Contato
            </DialogTitle>
            <DialogDescription>
              Informações de contato para {selectedContact?.name}:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Nome:</span>
                <span className="text-sm font-medium">{selectedContact?.name}</span>
              </div>
              {selectedContact?.email && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">{selectedContact.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleCopyContact(selectedContact.email, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {selectedContact?.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Telefone:</span>
                  <span className="text-sm font-medium">{selectedContact.phone}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleCopyContact(selectedContact.phone, 'Telefone')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setShowContactDialog(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Dados de Acesso */}
      <Dialog open={showAccessDataDialog} onOpenChange={setShowAccessDataDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-600" />
              Dados de Acesso
            </DialogTitle>
            <DialogDescription>
              Informações de acesso para {group?.services?.name}:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Serviço:</span>
                <span className="text-sm font-medium">{group?.services?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">acesso@wetv.com</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleCopyContact('acesso@wetv.com', 'Email')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Senha:</span>
                <span className="text-sm font-medium">••••••••</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleCopyContact('wetv2024', 'Senha')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-cyan-600 flex-shrink-0 mt-1" />
                <p className="text-xs text-cyan-700">
                  Não compartilhe estas informações com pessoas fora do grupo. 
                  O acesso é pessoal e intransferível.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setShowAccessDataDialog(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupDetails;
