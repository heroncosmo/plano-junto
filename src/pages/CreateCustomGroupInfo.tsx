import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';

const CreateCustomGroupInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData: previousData, fidelity } = location.state || {};
  
  const [formData, setFormData] = useState({
    shareWhat: '',
    serviceName: '',
    groupName: '',
    rules: '1. Não compartilhe a senha com ninguém fora deste grupo de assinatura\n2. Não utilize esta conta compartilhada para postar em meu nome do administrador\n3. Não altere a senha do grupo',
    extraInfo: '',
    website: ''
  });

  const [errors, setErrors] = useState({
    shareWhat: '',
    serviceName: '',
    groupName: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBack = () => {
    navigate('/create-group');
  };

  const validateForm = () => {
    const newErrors = {
      shareWhat: '',
      serviceName: '',
      groupName: ''
    };

    if (!formData.shareWhat.trim()) {
      newErrors.shareWhat = 'Por favor, informe o que deseja compartilhar';
    }

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = 'Por favor, informe o nome do serviço';
    }

    if (!formData.groupName.trim()) {
      newErrors.groupName = 'Por favor, informe o nome do grupo';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    navigate('/create-group/custom/fidelity', {
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
            <h1 className="text-lg font-medium text-gray-800">Primeiros passos</h1>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
          </div>
        </div>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 space-y-6">
            {/* O que vai compartilhar hoje? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                O que vai compartilhar hoje?
              </label>
              <Input
                placeholder="Ex: Netflix, Spotify, Adobe..."
                value={formData.shareWhat}
                onChange={(e) => handleInputChange('shareWhat', e.target.value)}
                className={errors.shareWhat ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.shareWhat && (
                <p className="text-red-500 text-xs mt-1">{errors.shareWhat}</p>
              )}
            </div>

            {/* Como o serviço se chama? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como o serviço se chama?
              </label>
              <Input
                placeholder="Nome do serviço"
                value={formData.serviceName}
                onChange={(e) => handleInputChange('serviceName', e.target.value)}
                className={errors.serviceName ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.serviceName && (
                <p className="text-red-500 text-xs mt-1">{errors.serviceName}</p>
              )}
            </div>

            {/* Como o grupo se chama? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como o grupo se chama?
              </label>
              <Input
                placeholder="Nome do grupo"
                value={formData.groupName}
                onChange={(e) => handleInputChange('groupName', e.target.value)}
                className={errors.groupName ? 'border-red-500 focus:border-red-500' : ''}
              />
              {errors.groupName && (
                <p className="text-red-500 text-xs mt-1">{errors.groupName}</p>
              )}
            </div>

            {/* Quais são as regras? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quais são as regras?
              </label>
              <Textarea
                placeholder="Regras do grupo..."
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value.slice(0, 500))}
                rows={6}
                className="resize-none"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.rules.length} / 500
              </div>
            </div>

            {/* Se tiver mais informações ou descrição, coloque aqui */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Se tiver mais informações ou descrição, coloque aqui
              </label>
              <Textarea
                placeholder="Informações adicionais..."
                rows={3}
                className="resize-none"
                value={formData.extraInfo}
                onChange={(e) => handleInputChange('extraInfo', e.target.value)}
              />
            </div>

            {/* Qual o site? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qual o site?
              </label>
              <Input
                placeholder="https://..."
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>

            {/* Aprovação automática */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-cyan-500 rounded-full mt-0.5 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-cyan-800 mb-1">Aprovação automática</h4>
                  <p className="text-sm text-cyan-700">
                    Clone um grupo já existente para não ter que esperar o tempo de aprovação. <a href="#" className="underline">Saiba mais</a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

export default CreateCustomGroupInfo;
