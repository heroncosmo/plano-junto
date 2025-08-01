import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  category: string;
  icon_url?: string;
  max_users: number;
  pre_approved: boolean;
}

const CreateGroup = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('pre_approved', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleServiceSelect = (service: Service) => {
    navigate(`/create-group/plan/${service.id}`, { 
      state: { service } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando serviços...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">O que vai compartilhar hoje?</h1>
          <p className="text-muted-foreground">
            Escolha o serviço que deseja compartilhar e economize até 80%
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Descubra o que quer compartilhar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Services Grid */}
        <div className="space-y-4">
          {filteredServices.map((service) => (
            <Card 
              key={service.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleServiceSelect(service)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {service.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Até {service.max_users} usuários
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum serviço encontrado para "{searchTerm}"
            </p>
          </div>
        )}

        {/* Custom Service Option */}
        <Card className="mt-6 border-dashed border-2">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Listar todos os serviços</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie seu próprio grupo e convide outras pessoas para dividir os custos
            </p>
            <Button variant="outline" onClick={() => navigate('/create-group/custom')}>
              + Criar Grupo
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CreateGroup;