import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCancellation } from '@/hooks/useCancellation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Info, 
  Trash2, 
  User, 
  CreditCard, 
  Gift, 
  Shield,
  Loader2,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  userName?: string;
}

const CANCELLATION_REASONS = [
  { value: 'problems_group', label: 'Tive problemas no grupo' },
  { value: 'no_longer_use', label: 'Não irei mais utilizar o serviço' },
  { value: 'money_tight', label: 'A grana ta curta, vou dar uma economizada' },
  { value: 'too_long', label: 'Muita demora para completar o grupo' },
  { value: 'admin_communication', label: 'Falta de comunicação com o administrador' },
  { value: 'other', label: 'Outros' }
];

export const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  userName
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    warnings,
    benefits,
    earlyCancellation,
    openComplaint,
    loading,
    currentStep,
    createCancellationRequest,
    confirmCancellation,
    dismissWarning,
    nextStep,
    previousStep,
    resetProcess
  } = useCancellation(groupId);

  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [cancellationId, setCancellationId] = useState<string | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // Resetar estado quando modal abrir
  React.useEffect(() => {
    if (isOpen) {
      resetProcess();
      setSelectedReason('');
      setDescription('');
      setCancellationId(null);
      setShowComplaintModal(false);
    }
  }, [isOpen, resetProcess]);

  const handleProceed = async () => {
    if (currentStep === 'info') {
      // Verificar se há reclamação em aberto
      if (openComplaint?.has_open_complaint) {
        setShowComplaintModal(true);
        return;
      }
      nextStep();
    } else if (currentStep === 'reason') {
      if (!selectedReason) {
        toast({
          title: "Motivo obrigatório",
          description: "Por favor, selecione um motivo para o cancelamento.",
          variant: "destructive"
        });
        return;
      }

      // Criar solicitação de cancelamento
      const result = await createCancellationRequest({
        user_id: user?.id || '',
        group_id: groupId,
        reason: selectedReason,
        description: description.trim() || undefined
      });

      if (result) {
        setCancellationId(result.cancellation_id);
        nextStep();
      }
    } else if (currentStep === 'confirmation') {
      if (cancellationId) {
        const success = await confirmCancellation(cancellationId);
        if (success) {
          nextStep();
          // Forçar refresh da página após cancelamento
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    }
  };

  const handleComplaintProceed = () => {
    setShowComplaintModal(false);
    nextStep();
  };

  const handleOpenComplaint = () => {
    // Implementar navegação para página de reclamação
    toast({
      title: "Abrir reclamação",
      description: "Você será redirecionado para a página de reclamação.",
    });
    setShowComplaintModal(false);
  };

  const renderInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Info className="h-8 w-8 text-gray-500" />
        </div>
        <DialogTitle className="text-xl font-semibold">Aviso Importante!</DialogTitle>
        <DialogDescription className="text-base mt-2">
          Antes de prosseguir com seu cancelamento precisamos que você saiba sobre algumas informações importantes:
        </DialogDescription>
      </div>

      {/* Informação específica do usuário */}
      {earlyCancellation?.is_early && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-cyan-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-cyan-900 font-medium">
                {userName || 'Você'}, você iniciou sua participação há menos de 5 dias.
              </p>
              <p className="text-sm text-cyan-700 mt-1">
                Se o motivo do cancelamento for um problema no grupo, você deve abrir reclamação.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-cyan-600 hover:text-cyan-700 text-sm mt-2"
                onClick={handleOpenComplaint}
              >
                Quero abrir uma reclamação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de cancelamento antecipado */}
      {earlyCancellation?.is_early && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Atenção!</p>
              <p className="text-sm text-red-700 mt-1">
                Sair de um grupo que acabou de se formar é prejudicial ao administrador. 
                Se optar pelo cancelamento de forma imediata você ficará restrito para 
                participar de grupos por um período de pelo menos {earlyCancellation.restriction_days} dias.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-red-600 text-center">
        * As taxas de processamento de pagamento não serão estornadas.
      </div>

      <div className="flex gap-3">
        <Button onClick={handleProceed} className="flex-1">
          Prosseguir
        </Button>
        <Button variant="outline" onClick={onClose}>
          Voltar
        </Button>
      </div>
    </div>
  );

  const renderReasonStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <DialogTitle className="text-xl font-semibold">
          Está de saída? Nosso grupo sentirá sua falta 🙂
        </DialogTitle>
        <DialogDescription className="text-base mt-2">
          Vimos que está pensando em cancelar sua assinatura neste grupo. Você pode nos contar o porquê?
        </DialogDescription>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Selecionar o motivo</Label>
        <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
          <div className="space-y-3">
            {CANCELLATION_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-2">
                <RadioGroupItem value={reason.value} id={reason.value} />
                <Label htmlFor={reason.value} className="text-sm cursor-pointer">
                  {reason.label}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Conte para gente um pouco mais do que te levou a cancelar sua participação.
          </Label>
          <Textarea
            id="description"
            placeholder="Descreva o motivo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleProceed} 
          className="flex-1"
          disabled={!selectedReason || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processando...
            </>
          ) : (
            'Continuar'
          )}
        </Button>
        <Button variant="outline" onClick={previousStep}>
          Voltar
        </Button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <DialogTitle className="text-xl font-semibold">
          Está de saída? Nosso grupo sentirá sua falta 😔
        </DialogTitle>
        <DialogDescription className="text-base mt-2">
          Vimos que está pensando em cancelar sua assinatura neste grupo. Você pode nos contar o porquê?
        </DialogDescription>
      </div>

      {/* Mostrar motivo selecionado */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">Motivo selecionado:</p>
        <p className="font-medium">
          {CANCELLATION_REASONS.find(r => r.value === selectedReason)?.label}
        </p>
      </div>

      {/* Benefícios perdidos */}
      {benefits && (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Você já economizou {benefits.savings_lost_formatted} em assinaturas desde que entrou no JuntaPlay! 
            Se você sair deste grupo agora, você irá perder:
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            {benefits.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{benefit.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem de conforto */}
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <p className="text-sm text-cyan-700">
          Se ainda sim decidir deixar o grupo, lembre-se, caso necessite assinar um serviço novamente, 
          nós te ajudamos a economizar e a manter as contas em ordem!
        </p>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleProceed} 
          className="flex-1 bg-red-600 hover:bg-red-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processando...
            </>
          ) : (
            'Encerrar inscrição'
          )}
        </Button>
        <Button variant="outline" onClick={previousStep}>
          Continuar utilizando o grupo
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <DialogTitle className="text-xl font-semibold text-green-600">
          Eba! xD
        </DialogTitle>
        <DialogDescription className="text-base mt-2">
          Cancelamento efetuado com sucesso.
        </DialogDescription>
      </div>

      <Button onClick={onClose} className="w-full">
        OK
      </Button>
    </div>
  );

  const renderComplaintModal = () => (
    <Dialog open={showComplaintModal} onOpenChange={setShowComplaintModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <DialogTitle>Reclamação em Aberto</DialogTitle>
          </div>
          <DialogDescription>
            Atenção
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Sua reclamação #{openComplaint?.complaint_number} aberta em{' '}
              {openComplaint?.created_at ? new Date(openComplaint.created_at).toLocaleDateString('pt-BR') : ''}, 
              ainda está em análise.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              <strong>Previsão de Encerramento:</strong> {' '}
              {openComplaint?.estimated_closure ? new Date(openComplaint.estimated_closure).toLocaleDateString('pt-BR') : ''}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Se prosseguir com o cancelamento:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">A reclamação será encerrada automaticamente</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Não haverá estorno proporcional referente à reclamação</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Concordo que li e estou de acordo com os termos acima</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleOpenComplaint} className="flex-1">
              Visualizar Reclamação
            </Button>
            <Button 
              onClick={handleComplaintProceed} 
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Prosseguir com Cancelamento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'info':
        return renderInfoStep();
      case 'reason':
        return renderReasonStep();
      case 'confirmation':
        return renderConfirmationStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderInfoStep();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          {renderCurrentStep()}
        </DialogContent>
      </Dialog>
      
      {renderComplaintModal()}
    </>
  );
}; 