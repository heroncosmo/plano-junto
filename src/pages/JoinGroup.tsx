import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Users, Home, Briefcase, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const JoinGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [group, setGroup] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [fidelityChecked, setFidelityChecked] = useState(false);
  const [processing, setProcessing] = useState(false);

  const relationshipOptions = [
    {
      id: 'familia',
      label: 'Moramos Juntos',
      description: 'Mesma residência',
      icon: <Home className="h-6 w-6" />
    },
    {
      id: 'familia',
      label: 'Família',
      description: 'Parentes',
      icon: <Heart className="h-6 w-6" />
    },
    {
      id: 'amigos',
      label: 'Amigos',
      description: 'Relacionamento pessoal',
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 'trabalho',
      label: 'Colegas de Trabalho',
      description: 'Relacionamento profissional',
      icon: <Briefcase className="h-6 w-6" />
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (id) {
      fetchGroupDetails();
    }
  }, [id, user]);

  const fetchGroupDetails = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (groupError) throw groupError;

      const { data: serviceData } = await supabase
        .from('services')
        .select('*')
        .eq('id', groupData.service_id)
        .single();

      setGroup(groupData);
      setService(serviceData);

    } catch (error) {
      console.error('Error fetching group details:', error);
      toast({
        title: "Erro ao carregar grupo",
        description: "Não foi possível carregar os detalhes do grupo",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!selectedRelationship || !agreementChecked || !fidelityChecked) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, complete todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      // Navigate to payment page
      navigate(`/group/${id}/payment`, {
        state: {
          group,
          service,
          relationshipType: selectedRelationship
        }
      });

    } catch (error) {
      console.error('Error processing join request:', error);
      toast({
        title: "Erro ao processar solicitação",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Grupo não encontrado</h1>
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/group/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos detalhes
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Junte-se ao grupo</h1>
            <p className="text-muted-foreground">
              Para este serviço é necessário informar o relacionamento que você tem com o administrador.
              O relacionamento abaixo está de acordo com os termos de uso do serviço desejado.
            </p>
          </div>

          {/* Relationship Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selecione seu relacionamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relationshipOptions.map((option) => (
                <div
                  key={option.id + option.label}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                    selectedRelationship === option.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedRelationship(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedRelationship === option.id 
                        ? 'bg-primary text-white' 
                        : 'bg-muted'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedRelationship === option.id 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {selectedRelationship === option.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Terms and Agreements */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Confirmações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="agreement"
                  checked={agreementChecked}
                  onCheckedChange={(checked) => setAgreementChecked(checked === true)}
                />
                <label htmlFor="agreement" className="text-sm leading-relaxed">
                  Confirmo que li e estou de acordo com as regras do serviço {service?.name} - {group.name}, 
                  ChatGPT, Deepseek e diversos modelos de IA, do platforma JuntaPlay e dos Termos de Fidelidade.
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Atenção!</h4>
                <p className="text-sm text-blue-700">
                  Este grupo só pode ativar a fidelidade após renovado automaticamente em 05/07/2025.
                  Para mais informações clique aqui.
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="fidelity"
                  checked={fidelityChecked}
                  onCheckedChange={(checked) => setFidelityChecked(checked === true)}
                />
                <label htmlFor="fidelity" className="text-sm">
                  Confirmo que li e estou de acordo com as regras e Termos de Uso da Grupos 
                  e que cumprirei em permanecer no grupo por um período determinado.
                  Para entender todas as vantagens sobre grupos com fidelidade clique aqui.
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Group Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resumo do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviço:</span>
                  <span className="font-medium">{service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grupo:</span>
                  <span className="font-medium">{group.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vagas:</span>
                  <span className="font-medium">
                    {group.current_members}/{group.max_members} 
                    {group.max_members - group.current_members > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {group.max_members - group.current_members} restante{group.max_members - group.current_members !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensalidade:</span>
                  <span className="font-medium">R$ {(group.price_per_slot_cents / 100).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total (com taxa):</span>
                  <span>R$ {((group.price_per_slot_cents + 450) / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(`/group/${id}`)}
            >
              Voltar
            </Button>
            <Button 
              className="flex-1 shadow-button"
              onClick={handleJoinGroup}
              disabled={!selectedRelationship || !agreementChecked || !fidelityChecked || processing}
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                'Próximo'
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JoinGroup;