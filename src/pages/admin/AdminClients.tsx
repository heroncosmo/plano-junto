import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllClients } from '@/integrations/supabase/functions';
import ClientDetailsModal from '@/components/ClientDetailsModal';

interface ClientData {
  user_id: string;
  full_name: string;
  balance_cents: number;
  created_at: string;
  email?: string;
}

const AdminClients = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<{id: string, name: string} | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsData = await getAllClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const openClientDetails = (clientId: string, clientName: string) => {
    setSelectedClientForDetails({ id: clientId, name: clientName });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Gerenciamento de Clientes</h2>
        <p className="text-gray-600">
          Visualize e gerencie todos os clientes do sistema
        </p>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-600">
              Não há clientes registrados no sistema.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <Card key={client.user_id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{client.full_name}</h3>
                      <p className="text-sm text-gray-600">{client.email || 'Email não disponível'}</p>
                      <p className="text-xs text-gray-500">Registrado em {formatDate(client.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Saldo</p>
                      <p className="font-semibold text-lg">{formatCurrency(client.balance_cents)}</p>
                    </div>
                    
                    <Button
                      onClick={() => openClientDetails(client.user_id, client.full_name)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
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

export default AdminClients; 