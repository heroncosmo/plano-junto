import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, Music, Gamepad2, Briefcase, GraduationCap, Home, Users, Handshake, Smartphone, Mail, Shield, CreditCard, Zap, Settings } from 'lucide-react';

const CreateCustomGroupQuestions2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData: previousData, fidelity } = location.state || {};
  
  const [formData, setFormData] = useState({
    category: 'video',
    relationship: 'familia',
    contactMethod: 'whatsapp',
    accessMethod: 'automatico',
    accessType: 'login'
  });

  const categories = [
    { id: 'video', label: 'Vídeo', icon: Video },
    { id: 'musica', label: 'Música', icon: Music },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'leitura', label: 'Leitura', icon: Briefcase },
    { id: 'escritorio', label: 'Escritório', icon: GraduationCap },
    { id: 'jogos', label: 'Jogos', icon: Gamepad2 }
  ];

  const relationships = [
    { id: 'moramos_juntos', label: 'Moramos juntos', icon: Home },
    { id: 'familia', label: 'Família', icon: Users },
    { id: 'amigos', label: 'Amigos', icon: Handshake },
    { id: 'colegas', label: 'Colegas de trabalho', icon: Briefcase }
  ];

  const contactMethods = [
    { id: 'whatsapp', label: 'E-mail e WhatsApp', icon: Smartphone },
    { id: 'email', label: 'E-mail', icon: Mail }
  ];

  const accessMethods = [
    { id: 'automatico', label: 'Após o grupo completar' },
    { id: 'imediatamente', label: 'Imediatamente' }
  ];

  const accessTypes = [
    { id: 'login', label: 'Login e Senha', icon: Shield },
    { id: 'convite', label: 'Convite', icon: Mail },
    { id: 'codigo', label: 'Código de Ativação', icon: Settings },
    { id: 'combinar', label: 'A combinar', icon: Zap }
  ];

  const handleSelection = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    navigate('/create-group/custom/questions');
  };

  const handleContinue = () => {
    navigate('/create-group/custom/summary', {
      state: { 
        formData: { ...previousData, ...formData },
        fidelity
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-medium text-gray-800">Só mais essas perguntas</h1>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Qual a categoria? */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Qual a categoria?</h3>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleSelection('category', category.id)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.category === category.id
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-xs">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Qual o relacionamento entre os participantes? */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Qual o relacionamento entre os participantes?</h3>
              <div className="grid grid-cols-2 gap-3">
                {relationships.map((relationship) => {
                  const IconComponent = relationship.icon;
                  return (
                    <button
                      key={relationship.id}
                      onClick={() => handleSelection('relationship', relationship.id)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.relationship === relationship.id
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-xs">{relationship.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Como os participantes podem falar com você? */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Como os participantes podem falar com você?</h3>
              <div className="grid grid-cols-2 gap-3">
                {contactMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleSelection('contactMethod', method.id)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.contactMethod === method.id
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-xs">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quando os participantes vão receber o acesso ao serviço? */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Quando os participantes vão receber o acesso ao serviço?</h3>
              <div className="space-y-3">
                {accessMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleSelection('accessMethod', method.id)}
                    className={`w-full p-4 rounded-lg border text-left transition-colors ${
                      formData.accessMethod === method.id
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                    }`}
                  >
                    <span className="text-sm">{method.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Como será disponibilizado o acesso ao serviço? */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Como será disponibilizado o acesso ao serviço?</h3>
              <div className="grid grid-cols-2 gap-3">
                {accessTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleSelection('accessType', type.id)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        formData.accessType === type.id
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                      }`}
                    >
                      <IconComponent className="h-6 w-6 mx-auto mb-2" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="mt-8">
          <Button 
            onClick={handleContinue}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            size="lg"
          >
            Próximo
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateCustomGroupQuestions2;
