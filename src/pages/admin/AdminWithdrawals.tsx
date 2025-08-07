import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Eye, Check, X, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ClientDetailsModal from '@/components/ClientDetailsModal';

interface WithdrawalData {
  id: string;
  user_id: string;
  amount_cents: number;
  pix_key: string;
  pix_key_type: string;
  status: string;
  created_at: string;
  processed_at?: string;
  profiles?: {
    full_name: string;
    user_id: string;
  };
}

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<string | null>(null);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<{id: string, name: string} | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  
  const { toast } = useToast();

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      
      // Buscar saques básicos
      const { data: withdrawalsData, error } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enriquecer com dados relacionados
      if (withdrawalsData && withdrawalsData.length > 0) {
        const enrichedWithdrawals = await Promise.all(
          withdrawalsData.map(async (withdrawal) => {
            // Buscar dados do usuário
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name, user_id')
              .eq('user_id', withdrawal.user_id)
              .single();

            return {
              ...withdrawal,
              profiles: userData
            };
          })
        );

        setWithdrawals(enrichedWithdrawals);
      } else {
        setWithdrawals([]);
      }
    } catch (error) {
      console.error('Erro ao carregar saques:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de saques.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: string) => {
    try {
      setProcessingWithdrawal(withdrawalId);
      
      // Chamar função SQL para processar saque
      const { data, error } = await supabase
        .rpc('process_withdrawal', {
          withdrawal_id: withdrawalId
        });
        
      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: "Saque Processado",
          description: "Saque foi processado com sucesso.",
        });
      } else {
        throw new Error(data?.error || 'Erro ao processar saque');
      }
      
      await loadWithdrawals();
      
    } catch (error) {
      console.error('Erro ao processar saque:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar saque.",
        variant: "destructive",
      });
    } finally {
      setProcessingWithdrawal(null);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
      toast({
        title: "Copiado!",
        description: "Informação copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  const openClientDetails = (clientId: string, clientName: string) => {
    setSelectedClientForDetails({ id: clientId, name: clientName });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p>Carregando saques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Processamento de Saques</h2>
        <p className="text-gray-600">
          Gerencie os saques solicitados pelos usuários
        </p>
      </div>

      {withdrawals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum saque encontrado</h3>
            <p className="text-gray-600">
              Não há saques registrados no sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {withdrawal.profiles?.full_name || 'Usuário não identificado'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(withdrawal.amount_cents)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Solicitado em {formatDate(withdrawal.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(withdrawal.status)}>
                        {getStatusLabel(withdrawal.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(withdrawal.pix_key, `pix_${withdrawal.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        {copiedStates[`pix_${withdrawal.id}`] ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Chave PIX
                      </Button>
                      
                      <Button
                        onClick={() => copyToClipboard(formatCurrency(withdrawal.amount_cents), `amount_${withdrawal.id}`)}
                        variant="outline"
                        size="sm"
                      >
                        {copiedStates[`amount_${withdrawal.id}`] ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Valor
                      </Button>
                      
                      <Button
                        onClick={() => openClientDetails(withdrawal.user_id, withdrawal.profiles?.full_name || 'Cliente')}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Cliente
                      </Button>
                      
                      {withdrawal.status === 'pending' && (
                        <Button
                          onClick={() => handleProcessWithdrawal(withdrawal.id)}
                          disabled={processingWithdrawal === withdrawal.id}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {processingWithdrawal === withdrawal.id ? 'Processando...' : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Processar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Informações do PIX</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo da Chave:</span>
                      <span className="font-medium ml-2">{withdrawal.pix_key_type}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Chave PIX:</span>
                      <span className="font-medium ml-2">{withdrawal.pix_key}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClientForDetails && (
        <ClientDetailsModal
          userId={selectedClientForDetails.id}
          userName={selectedClientForDetails.name}
          onClose={() => setSelectedClientForDetails(null)}
        />
      )}
    </div>
  );
};

export default AdminWithdrawals; 