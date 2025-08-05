import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Clipboard, User, MessageCircle, Shield, Users, Phone, Mail, Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface GroupData {
  id: string;
  name: string;
  description?: string;
  service_id: string;
  service_name: string;
  service_category: string;
  admin_id: string;
  admin_name: string;
  admin_email: string;
  admin_phone?: string;
  created_at: string;
  member_count: number;
  monthly_value?: number;
}

const ReclamacaoDadosGrupo: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [contactedAdmin, setContactedAdmin] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados reais do grupo
  useEffect(() => {
    const loadGroupData = async () => {
      if (!groupId) {
        setError('ID do grupo não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar dados do grupo com informações do serviço e administrador
        const { data: groupData, error: groupError } = await supabase
          .from('groups_detailed')
          .select(`
            id,
            name,
            description,
            service_id,
            service_name,
            service_category,
            admin_id,
            admin_name,
            created_at,
            price_per_slot_cents
          `)
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;

        // Buscar contagem de membros
        const { count: memberCount, error: memberError } = await supabase
          .from('group_memberships')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupId)
          .eq('status', 'active');

        if (memberError) throw memberError;

        // Buscar dados do administrador na tabela profiles
        const { data: adminProfile, error: adminError } = await supabase
          .from('profiles')
          .select('phone')
          .eq('user_id', groupData.admin_id)
          .single();

        if (adminError) {
          console.warn('Erro ao buscar dados do admin:', adminError);
        }

        // Formatar dados para o componente
        const formattedData: GroupData = {
          id: groupData.id,
          name: groupData.name,
          description: groupData.description,
          service_id: groupData.service_id,
          service_name: groupData.service_name,
          service_category: groupData.service_category,
          admin_id: groupData.admin_id,
          admin_name: groupData.admin_name || 'Administrador',
          admin_email: 'contato@juntaplay.com.br', // Email padrão do sistema
          admin_phone: adminProfile?.phone || undefined,
          created_at: groupData.created_at,
          member_count: memberCount || 0,
          monthly_value: groupData.price_per_slot_cents ? groupData.price_per_slot_cents / 100 : undefined
        };

        console.log('Dados do grupo carregados:', formattedData);
        setGroupData(formattedData);

      } catch (error) {
        console.error('Erro ao carregar dados do grupo:', error);
        setError('Erro ao carregar dados do grupo. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [groupId]);

  const handleNext = () => {
    if (contactedAdmin) {
      if (groupId) {
        navigate(`/reclamacao/oque-aconteceu?groupId=${groupId}`);
      } else {
        navigate('/reclamacao/oque-aconteceu');
      }
    }
  };

  const handleBack = () => {
    if (groupId) {
      navigate(`/reclamacao/perguntas-frequentes?groupId=${groupId}`);
    } else {
      navigate('/reclamacao/perguntas-frequentes');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const isNextDisabled = !contactedAdmin;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Carregando dados do grupo...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !groupData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h2>
                  <p className="text-gray-600 mb-4">{error || 'Dados do grupo não encontrados'}</p>
                  <Button onClick={handleBack} className="w-full">
                    Voltar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Título */}
              <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Dados do seu grupo
              </h1>

              {/* Ilustração */}
              <div className="mb-6 flex justify-center">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-24 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Clipboard className="w-10 h-10 text-cyan-600" />
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </div>

              {/* Texto explicativo melhorado */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">
                      💡 Dica importante
                    </h3>
                    <p className="text-sm text-blue-700">
                      Antes de abrir uma reclamação, tente resolver diretamente com o administrador. 
                      Muitos problemas são resolvidos rapidamente com uma conversa amigável!
                    </p>
                  </div>
                </div>
              </div>

              {/* Seções de dados interativas */}
              <div className="space-y-4 mb-6">
                {/* Informações do grupo */}
                <div 
                  className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-300 transition-colors"
                  onClick={() => toggleSection('group')}
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">Informações do grupo</span>
                    </div>
                    {expandedSection === 'group' ? (
                      <ArrowRight className="w-4 h-4 text-cyan-600 rotate-90" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {expandedSection === 'group' && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Nome do grupo:</span>
                          <span className="text-sm font-medium text-gray-900">{groupData.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Serviço:</span>
                          <span className="text-sm font-medium text-gray-900">{groupData.service_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Categoria:</span>
                          <span className="text-sm font-medium text-gray-900">{groupData.service_category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Membros:</span>
                          <span className="text-sm font-medium text-gray-900">{groupData.member_count} pessoas</span>
                        </div>
                        {groupData.monthly_value && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Valor mensal:</span>
                            <span className="text-sm font-medium text-gray-900">
                              R$ {groupData.monthly_value.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Criado em:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(groupData.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Relacionamento informado */}
                <div 
                  className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-300 transition-colors"
                  onClick={() => toggleSection('relationship')}
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">Relacionamento informado</span>
                    </div>
                    {expandedSection === 'relationship' ? (
                      <ArrowRight className="w-4 h-4 text-cyan-600 rotate-90" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {expandedSection === 'relationship' && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tipo de serviço:</span>
                          <span className="text-sm font-medium text-gray-900">{groupData.service_name}</span>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-green-800 mb-1">
                                ✅ Assinatura ativa e protegida
                              </p>
                              <p className="text-xs text-green-700">
                                Seu pagamento está seguro e você tem acesso garantido ao serviço pelo período contratado.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Dados do administrador */}
                <div 
                  className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-300 transition-colors"
                  onClick={() => toggleSection('admin')}
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-700">Dados do administrador</span>
                    </div>
                    {expandedSection === 'admin' ? (
                      <ArrowRight className="w-4 h-4 text-cyan-600 rotate-90" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  
                  {expandedSection === 'admin' && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Nome:</span>
                            <span className="text-sm font-medium text-gray-900">{groupData.admin_name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Email de contato:</span>
                            <span className="text-sm font-medium text-gray-900">{groupData.admin_email}</span>
                          </div>
                          {groupData.admin_phone && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Telefone:</span>
                              <span className="text-sm font-medium text-gray-900">{groupData.admin_phone}</span>
                            </div>
                          )}
                          {!groupData.admin_phone && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Telefone:</span>
                              <span className="text-sm text-gray-500">Não informado</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Informação sobre contato */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <div className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0">ℹ️</div>
                            <div>
                              <p className="text-xs font-medium text-blue-800 mb-1">
                                Informação de contato
                              </p>
                              <p className="text-xs text-blue-700">
                                Use o email do JuntaPlay para entrar em contato. Nossa equipe intermediará a comunicação com o administrador.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Botões de contato */}
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600 mb-3">
                            💬 Entre em contato diretamente com o administrador:
                          </p>
                          <div className="space-y-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => window.open(`mailto:${groupData.admin_email}`, '_blank')}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Enviar email
                            </Button>
                            {groupData.admin_phone && groupData.admin_phone !== 'Não informado' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs"
                                onClick={() => window.open(`tel:${groupData.admin_phone}`, '_blank')}
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Ligar agora
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Aviso sobre contato direto */}
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-orange-800 mb-1">
                      🎯 Resolva rapidamente!
                    </h3>
                    <p className="text-sm text-orange-700">
                      A maioria dos problemas é resolvida em poucos minutos quando você entra em contato diretamente com o administrador. 
                      Só abra uma reclamação se realmente não conseguir resolver de outra forma.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkbox de contato melhorado */}
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="contacted-admin"
                    checked={contactedAdmin}
                    onCheckedChange={(checked) => setContactedAdmin(checked as boolean)}
                    className="mt-0.5"
                  />
                  <div>
                    <label
                      htmlFor="contacted-admin"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Já entrei em contato com o administrador do grupo
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Marque esta opção se você já tentou resolver o problema diretamente com o administrador.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de navegação */}
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={`w-full ${
                    isNextDisabled 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  }`}
                >
                  {isNextDisabled ? 'Entre em contato primeiro' : 'Continuar para reclamação'}
                </Button>
                
                <button
                  onClick={handleBack}
                  className="text-cyan-600 hover:text-cyan-700 text-sm flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReclamacaoDadosGrupo; 