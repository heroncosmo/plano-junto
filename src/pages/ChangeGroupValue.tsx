import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGroupById, formatPrice } from '@/hooks/useGroups';
import { supabase } from '@/integrations/supabase/client';

const ChangeGroupValue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newValue, setNewValue] = useState('');

  const { group, loading, error, refetch } = useGroupById(id || '');

  // Verificar se o usuário é o admin do grupo
  const isGroupAdmin = group && user && group.admin_id === user.id;

  useEffect(() => {
    if (!loading && (!group || !isGroupAdmin)) {
      navigate('/my-groups');
    }
  }, [group, loading, isGroupAdmin, navigate]);

  // Inicializar o campo com o valor atual quando o grupo carregar
  useEffect(() => {
    if (group) {
      const currentValue = (group.price_per_slot_cents / 100).toFixed(2).replace('.', ',');
      setNewValue(currentValue);
    }
  }, [group]);

  const handleChangeValue = async () => {
    if (!newValue || parseFloat(newValue.replace(',', '.')) <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, digite um valor válido maior que zero.",
        variant: "destructive"
      });
      return;
    }

    const maxValue = group.price_per_slot_cents + 400; // Valor máximo permitido
    const newValueInCents = parseFloat(newValue.replace(',', '.')) * 100;

    if (newValueInCents > maxValue) {
      toast({
        title: "Valor excede o máximo permitido",
        description: `O valor máximo permitido é ${formatPrice(maxValue)}.`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Atualizar o valor do grupo no banco de dados
      const { error } = await supabase
        .from('groups')
        .update({ 
          price_per_slot_cents: newValueInCents,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Recarregar os dados do grupo para refletir a mudança
      await refetch();

      toast({
        title: "Valor alterado com sucesso!",
        description: "O valor do grupo foi atualizado.",
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Erro ao alterar valor do grupo:', error);
      toast({
        title: "Erro ao alterar valor",
        description: "Houve um problema ao alterar o valor do grupo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToGroup = () => {
    navigate(`/group/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Grupo Não Encontrado</h1>
        <p className="text-gray-600 mb-4">Este grupo não existe mais ou o link está incorreto.</p>
        <Button onClick={() => navigate('/my-groups')}>Voltar para Meus Grupos</Button>
      </div>
    );
  }

  if (!isGroupAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-4">Você não tem permissão para alterar este grupo.</p>
        <Button onClick={() => navigate('/my-groups')}>Voltar para Meus Grupos</Button>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Valor alterado com sucesso!</h1>
            <p className="text-gray-600 mb-6">O valor do grupo foi alterado conforme solicitado.</p>
            <Button onClick={handleBackToGroup} className="w-full">
              Voltar para o grupo
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/group/${id}`)}
            className="flex items-center gap-2 text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">Alteração de valor</h1>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(group.price_per_slot_cents)}
                </div>
                <div className="text-sm text-gray-500">
                  valor atual do grupo
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">
                  Valor máximo permitido para {group.services?.name || 'Spotify Duo'}
                </div>
                <div className="text-lg font-semibold text-cyan-600">
                  {formatPrice(group.price_per_slot_cents + 400)} {/* Simulando valor máximo */}
                </div>
              </div>
            </CardContent>
                     </Card>

           {/* Campo para novo valor */}
           <div className="space-y-3">
             <Label htmlFor="newValue" className="text-sm font-medium text-gray-700">
               Novo valor do grupo
             </Label>
             <div className="relative">
               <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                 R$
               </span>
               <Input
                 id="newValue"
                 type="text"
                 placeholder="0,00"
                 value={newValue}
                 onChange={(e) => {
                   // Permitir apenas números, vírgula e ponto
                   const value = e.target.value.replace(/[^\d,.]/g, '');
                   // Garantir apenas uma vírgula ou ponto
                   const parts = value.split(/[,.]/);
                   if (parts.length <= 2) {
                     setNewValue(value);
                   }
                 }}
                 className="pl-8"
               />
             </div>
             <p className="text-xs text-gray-500">
               Digite o novo valor que deseja para o grupo
             </p>
           </div>

           <div className="space-y-3">
                         <Button
               onClick={handleChangeValue}
               disabled={isProcessing || !newValue}
               className="w-full"
               size="lg"
             >
               {isProcessing ? 'Alterando...' : 'Alterar'}
             </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/group/${id}`)}
              className="w-full"
            >
              Voltar
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChangeGroupValue; 