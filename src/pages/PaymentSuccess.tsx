import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useGroupById } from '@/hooks/useGroups';

const PaymentSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { group, loading } = useGroupById(id || '');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h1>
            <p className="text-gray-600">Sua inscrição foi realizada com sucesso.</p>
          </div>

          {/* Group Info */}
          {group && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{group.services?.name || 'Serviço não disponível'}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-green-600 font-medium">Ativo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Próximo pagamento:</span>
                      <span className="font-medium">15/09/2024</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Próximos passos:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Dados de acesso serão enviados em até 24h</li>
                <li>• Você receberá um email com as instruções</li>
                <li>• Suporte disponível via WhatsApp</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir para Dashboard
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/groups')}
                className="flex-1"
              >
                Ver Mais Grupos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccess; 