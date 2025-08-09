import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CreateCustomGroupSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state || {};
  const { user } = useAuth();

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleBack = () => {
    navigate('/create-group/custom/values', { state: { formData } });
  };

  const handleCreateGroup = async () => {
    if (!agreedToTerms) {
      alert('Você precisa concordar com os termos para continuar');
      return;
    }

    if (!user) {
      alert('Você precisa estar logado para criar um grupo');
      return;
    }

    setIsCreating(true);

    try {
      // 1. Primeiro, criar um serviço personalizado
      const totalSlots = formData.customSlots ?
        parseInt(formData.customSlotsValue) :
        parseInt(formData.totalSlots);

      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .insert({
          name: formData.serviceName || 'Serviço Personalizado',
          category: formData.category || 'other',
          max_users: totalSlots || 6,
          pre_approved: false,
          website: formData.website || null
        })
        .select()
        .single();

      if (serviceError) {
        console.error('Erro ao criar serviço:', serviceError);
        throw serviceError;
      }

      // 2. Criar o grupo
      const reservedSlots = formData.customReserved ?
        parseInt(formData.customReservedValue) :
        parseInt(formData.reservedSlots);

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          admin_id: user.id,
          service_id: serviceData.id,
          name: formData.groupName || formData.serviceName || 'Grupo Personalizado',
          description: formData.description || '',
          rules: formData.rules || 'Não compartilhe a senha com ninguém fora deste grupo de assinatura\nNão utilize esta conta compartilhada para postar em meu nome do administrador\nNão altere a senha do grupo',
          relationship_type: formData.relationship || 'amigos',
          max_members: totalSlots || 6,
          price_per_slot_cents: Math.round((parseFloat(formData.serviceCost) || 0) * 100),
          status: 'pending_admin_approval',
          instant_access: formData.accessMethod === 'imediatamente',
          admin_approved: false,
          owner_approved: false,
          fidelity_months: formData.fidelity === 'sem' ? 0 : parseInt(formData.fidelity) || 0,
          other_info: formData.website || '',
          contact_method: formData.contactMethod || 'email',
          reserved_slots: reservedSlots || 1
        })
        .select()
        .single();

      if (groupError) {
        console.error('Erro ao criar grupo:', groupError);
        throw groupError;
      }

      // 3. Criar membership para o admin (para que apareça na aba "Administrando" e não "Participando")
      // Não criamos membership para o admin, pois ele deve aparecer apenas na aba "Administrando"
      // O admin é identificado pelo campo admin_id na tabela groups

      // Sucesso - mostrar modal
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      alert('Erro ao criar grupo. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/my-groups');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-medium text-gray-800">Veja o resumo do seu grupo</h1>
          </div>
          <button
            onClick={() => navigate('/create-group/custom/values')}
            className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors"
          >
            <Edit className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Primeira seção - Informações básicas */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Serviço: {formData?.serviceName || 's'}</span>
              <button
                onClick={() => navigate('/create-group/custom/values')}
                className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors"
              >
                <Edit className="h-3 w-3 text-white" />
              </button>
            </div>

            <div>
              <span className="text-sm text-gray-700">Nome do grupo: {formData?.groupName || 's'}</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">Regras:</span>
                  <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                <div>Não compartilhe a senha com ninguém fora deste grupo de assinatura</div>
                <div>Não utilize esta conta compartilhada para postar em meu nome do administrador</div>
                <div>Não altere a senha do grupo</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">Descrição: {formData?.description || 's'}...</span>
                  <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
                </div>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-700">Site: {formData?.website || 's'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Segunda seção - Fidelidade */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                Fidelidade: {formData?.fidelity === 'sem' || !formData?.fidelity ? 'Sem fidelidade' : `${formData.fidelity} ${formData.fidelity === '1' ? 'mês' : 'meses'}`}
              </span>
              <button
                onClick={() => navigate('/create-group/custom/fidelity', { state: { formData } })}
                className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors"
              >
                <Edit className="h-3 w-3 text-white" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Terceira seção - Valores */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Valor do serviço: R$ {formData?.serviceCost || '10,00'}</span>
              <button
                onClick={() => navigate('/create-group/custom/values')}
                className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 transition-colors"
              >
                <Edit className="h-3 w-3 text-white" />
              </button>
            </div>

            <div>
              <span className="text-sm text-gray-700">Valor promocional: Não</span>
            </div>

            <div>
              <span className="text-sm text-gray-700">Vagas Totais: {formData?.totalSlots || '3'}</span>
            </div>

            <div>
              <span className="text-sm text-gray-700">Reservadas para você: {formData?.reservedSlots || '2'}</span>
            </div>

            {/* Destaque para o valor que os membros pagam */}
            <div className="bg-cyan-50 border-l-4 border-cyan-500 p-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-cyan-800">Os membros irão pagar: R$ 6,83</span>
                <span className="text-xs text-cyan-600 cursor-pointer hover:underline">Reduzir valor</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quarta seção - Suporte e configurações */}
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Suporte aos membros: E-mail e WhatsApp</span>
              <button
                onClick={() => navigate('/create-group/custom/questions')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Envio de acesso: Após o grupo completar</span>
              <button
                onClick={() => navigate('/create-group/custom/questions')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>


          </CardContent>
        </Card>

        {/* Termos */}
        <div className="mt-6">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <span className="text-xs text-gray-600">
              Confirmo estar ciente de que a plataforma <span className="font-medium">Kotas</span> não está associada ou afiliada ao
              serviço & Concordo em cumprir integralmente os termos do serviço e da plataforma <span className="font-medium">Kotas</span>
            </span>
          </label>
        </div>

        {/* Create Group Button */}
        <div className="mt-8">
          <Button
            onClick={handleCreateGroup}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            size="lg"
            disabled={!agreedToTerms || isCreating}
          >
            {isCreating ? 'Criando Grupo...' : 'Criar Grupo'}
          </Button>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <button 
            onClick={handleBack}
            className="text-cyan-500 text-sm underline"
          >
            Voltar
          </button>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-green-500">✅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Grupo Criado!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Seu grupo personalizado foi criado com sucesso e está aguardando aprovação do administrador.
              <br />
              <br />
              Você será notificado quando o grupo for aprovado e estiver disponível para membros.
            </p>
            <Button
              onClick={handleModalClose}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Entendi
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CreateCustomGroupSummary;
