import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronRight, Search, ChevronLeft, Play, Music, Briefcase, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Service {
  id: string;
  name: string;
  category: string;
  icon_url?: string;
  max_users: number;
  pre_approved: boolean;
}

const AllServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllServices();
  }, []);

  const fetchAllServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
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

  // Função para obter o ícone baseado no nome do serviço
  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('youtube') || name.includes('premium')) return Play;
    if (name.includes('spotify')) return Music;
    if (name.includes('mubi')) return Play;
    if (name.includes('lastpass') || name.includes('1password')) return Briefcase;
    if (name.includes('devmedia')) return GraduationCap;
    return Play; // ícone padrão
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando serviços...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/create-group')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Todos os Serviços</h1>
          <p className="text-gray-600">Escolha o serviço que deseja compartilhar</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Pesquisar serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-sm border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 rounded-lg"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const IconComponent = getServiceIcon(service.name);
            return (
              <Card 
                key={service.id} 
                className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-cyan-300 bg-white"
                onClick={() => handleServiceSelect(service)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{service.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Até {service.max_users} usuários</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredServices.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              Nenhum serviço encontrado para "{searchTerm}"
            </p>
          </div>
        )}

        {filteredServices.length === 0 && !searchTerm && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              Nenhum serviço disponível no momento
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllServices; 