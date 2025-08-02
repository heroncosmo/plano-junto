import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft,
  Home,
  Users,
  Handshake,
  Briefcase,
  Info,
  HelpCircle
} from 'lucide-react';
import { useGroupById, formatPrice } from '@/hooks/useGroups';

type RelationshipType = 'moramos_juntos' | 'familia' | 'amigos' | 'trabalho';

const JoinGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType>('familia');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { group, loading, error } = useGroupById(id || '');

  const relationshipOptions = [
    {
      id: 'moramos_juntos' as RelationshipType,
      title: 'Moramos juntos',
      icon: Home,
      description: 'Compartilhamos o mesmo endereço'
    },
    {
      id: 'familia' as RelationshipType,
      title: 'Família',
      icon: Users,
      description: 'Membros da mesma família'
    },
    {
      id: 'amigos' as RelationshipType,
      title: 'Amigos',
      icon: Handshake,
      description: 'Amizade próxima'
    },
    {
      id: 'trabalho' as RelationshipType,
      title: 'Colegas de Trabalho',
      icon: Briefcase,
      description: 'Companheiros de trabalho'
    }
  ];

  const handleNext = () => {
    if (!agreedToTerms) {
      alert('Você precisa concordar com os termos para continuar');
      return;
    }
    navigate(`/payment/${id}?relationship=${selectedRelationship}`);
  };

  const handleBack = () => {
    navigate(`/group/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-2">Erro</h1>
        <p className="text-gray-600 mb-4">Não foi possível carregar os dados do grupo.</p>
        <Button onClick={() => navigate('/')}>Voltar para o Início</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Junte-se ao grupo</h1>
        </div>

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            Para este serviço é necessário informar o relacionamento que você tem com o administrador. 
            O relacionamento abaixo está de acordo com os termos de uso do serviço desejado. 
            Ficou com dúvida? <a href="#" className="text-blue-600 underline">Saiba mais</a>.
          </p>
        </div>

        {/* Relationship Options */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {relationshipOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedRelationship === option.id;
            
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRelationship(option.id)}
              >
                <CardContent className="p-3 text-center relative">
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Info className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-center space-y-1">
                    <IconComponent className="h-6 w-6 text-gray-600" />
                    <div>
                      <h3 className="font-medium text-xs text-gray-900">{option.title}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Terms Checkbox */}
        <div className="mb-6">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              className="mt-0.5"
            />
            <label htmlFor="terms" className="text-xs text-gray-700 leading-relaxed">
                      Confirmo estar ciente de que a plataforma JuntaPlay não está associada ou afiliada ao serviço {group.services?.name || 'Serviço não disponível'}.
        Concordo em cumprir integralmente os termos do serviço {group.services?.name || 'Serviço não disponível'} e da plataforma JuntaPlay.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleNext}
            disabled={!agreedToTerms}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Próximo
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="w-full text-blue-600 hover:text-blue-700 text-xs"
          >
            Voltar
          </Button>
        </div>
      </main>

      {/* Floating Help Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg"
          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default JoinGroup;