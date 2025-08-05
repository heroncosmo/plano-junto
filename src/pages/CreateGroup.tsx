import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, Search, Wrench, Lock, Play, Music, Briefcase, GraduationCap } from 'lucide-react';
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
      
      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Header - Clone exato do Kotas */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-medium text-gray-800">O que vai compartilhar hoje?</h1>
        </div>

        {/* Card Container - Clone exato do Kotas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Services Grid - Clone exato do Kotas */}
          <div className="space-y-0">
            {filteredServices.slice(0, 6).map((service, index) => {
              const IconComponent = getServiceIcon(service.name);
              return (
                <div 
                  key={service.id} 
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    index < filteredServices.slice(0, 6).length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 text-sm">{service.name}</h3>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              );
            })}
          </div>

          {/* Listar todos os serviços - Clone exato do Kotas */}
          <div className="border-t border-gray-100">
            <div 
              onClick={() => navigate('/create-group/all-services')}
              className="flex items-center justify-between p-4 text-cyan-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <span>Listar todos os serviços</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-200 my-8"></div>

        {/* Grupo Público - Clone exato do Kotas */}
        <Card className="mb-4 bg-white border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-2">Grupo Público</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  É preciso fornecer todas as configurações do que será compartilhado para que 
                  seu grupo seja listado no site. Grupos públicos podem passar por aprovação.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Grupo Privado - Clone exato do Kotas */}
        <Card className="bg-cyan-700 text-white hover:shadow-md transition-all duration-200 cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white mb-2">Grupo privado</h3>
                <p className="text-sm text-cyan-100 leading-relaxed">
                  Somente as pessoas que você convidar ou que pertençam a sua rede de amigos 
                  poderão fazer parte. Não requer aprovação.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-cyan-200 flex-shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default CreateGroup;