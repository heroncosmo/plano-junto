import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, FileText, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSystemStats } from '@/integrations/supabase/functions';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SystemStats {
  totalClients: number;
  totalTransactions: number;
  totalGroups: number;
  totalBalance: number;
}

const AdminDashboard = () => {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Payment credentials form state
  const [mpToken, setMpToken] = useState('');
  const [savingToken, setSavingToken] = useState(false);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      const stats = await getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar estatísticas do sistema.",
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

  const handleSaveMpToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpToken || mpToken.length < 16) {
      toast({ title: 'Token inválido', description: 'Informe um Access Token válido do Mercado Pago.', variant: 'destructive' });
      return;
    }
    try {
      setSavingToken(true);
      const { data, error } = await supabase.functions.invoke('admin-save-credential', {
        body: { provider: 'mercadopago', token: mpToken }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: 'Credencial salva', description: 'Access Token gravado com sucesso (write-only).' });
      setMpToken('');
    } catch (err: any) {
      console.error('Erro ao salvar credencial:', err);
      toast({ title: 'Erro ao salvar', description: err?.message || 'Falha ao salvar credencial.', variant: 'destructive' });
    } finally {
      setSavingToken(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Visão Geral do Sistema</h2>
        <p className="text-gray-600">Estatísticas gerais do JuntaPlay</p>
      </div>

      {systemStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-600">Total de Clientes</h3>
              <p className="text-2xl font-bold">{systemStats.totalClients}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-600">Total de Transações</h3>
              <p className="text-2xl font-bold">{systemStats.totalTransactions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-600">Total de Grupos</h3>
              <p className="text-2xl font-bold">{systemStats.totalGroups}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm text-gray-600">Saldo Total do Sistema</h3>
              <p className="text-2xl font-bold">{formatCurrency(systemStats.totalBalance)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-blue-900">Aprovar Grupos</h4>
                  <p className="text-sm text-blue-700">Grupos aguardando aprovação</p>
                </div>
                <Crown className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-green-900">Processar Saques</h4>
                  <p className="text-sm text-green-700">Saques pendentes de processamento</p>
                </div>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-purple-900">Reclamações</h4>
                  <p className="text-sm text-purple-700">Reclamações que precisam de mediação</p>
                </div>
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveMpToken} className="space-y-4">
              <div>
                <Label className="text-sm">Provedor</Label>
                <Input value="Mercado Pago" disabled className="mt-1 bg-gray-50" />
              </div>
              <div>
                <Label htmlFor="mpToken" className="text-sm">Access Token (produção)</Label>
                <Input
                  id="mpToken"
                  type="password"
                  placeholder="Cole aqui seu Access Token do Mercado Pago"
                  value={mpToken}
                  onChange={(e) => setMpToken(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Write-only. O token não será exibido novamente.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={savingToken}>
                  {savingToken ? 'Salvando...' : 'Salvar Credencial'}
                </Button>
              </div>

              <div className="text-[11px] text-gray-500">
                Segurança: armazenado criptografado no banco (RLS ativa), gravado via função segura e acessado apenas por funções server-side.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Versão do Sistema</span>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status do Banco</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Última Atualização</span>
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 