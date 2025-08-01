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
      
      <main className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Header - Ultra compacto */}
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold">O que vai compartilhar hoje?</h1>
        </div>

        {/* Search - Ultra compacto */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Descubra o que está compartilhando"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8 text-sm border-gray-300"
          />
        </div>

        {/* Services Grid - Cards ultra compactos */}
        <div className="space-y-1">
          {filteredServices.slice(0, 4).map((service) => (
            <Card 
              key={service.id} 
              className="hover:shadow-sm transition-shadow cursor-pointer border-gray-200"
              onClick={() => handleServiceSelect(service)}
            >
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {service.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{service.name}</h3>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length > 4 && (
          <div className="mt-2">
            <button 
              onClick={() => navigate('/create-group/custom')}
              className="w-full text-cyan-500 text-xs font-medium py-2 hover:text-cyan-600 transition-colors flex items-center justify-between border border-gray-200 rounded px-2"
            >
              <span>Listar todos os serviços</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Grupo Público - Ultra compacto */}
        <Card className="mt-3 bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">Grupo Público</h3>
                <p className="text-xs text-muted-foreground">
                  É preciso fornecer todas as configurações do que será compartilhado para que 
                  seu grupo seja listado no site. Grupos públicos podem passar por aprovação.
                </p>
              </div>
              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>
          </CardContent>
        </Card>

        {/* Grupo Privado - Ultra compacto */}
        <Card className="mt-2 bg-gray-800 text-white">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm mb-1">Grupo privado</h3>
                <p className="text-xs text-gray-300">
                  Somente as pessoas que você convidou poderão participar deste grupo. 
                  Ideal para grupos fechados entre amigos e família.
                </p>
              </div>
              <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0 mt-0.5" />
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CreateGroup;