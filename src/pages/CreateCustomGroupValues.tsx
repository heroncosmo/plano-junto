import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

const CreateCustomGroupValues = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceName: '',
    groupName: '',
    description: '',
    rules: '',
    pricePerSlot: '',
    totalSlots: '',
    availableSlots: ''
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

  const handleContinue = () => {
    navigate('/create-group/custom/fidelity', {
      state: { formData }
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
            <h1 className="text-lg font-medium text-gray-800">Valores e disponibilidade</h1>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6 space-y-6">
            {/* Quanto custará o serviço? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quanto custará o serviço?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="10,00"
                  className="pl-8"
                  value={formData.pricePerSlot}
                  onChange={(e) => handleInputChange('pricePerSlot', e.target.value)}
                />
              </div>
            </div>

            {/* Valor do serviço a compartilhar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do serviço a compartilhar? *
              </label>
              <Input
                placeholder="Vagas totais"
                value={formData.totalSlots}
                onChange={(e) => handleInputChange('totalSlots', e.target.value)}
              />
            </div>

            {/* Quantas serão reservadas para você? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantas serão reservadas para você?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInputChange('availableSlots', num.toString())}
                    className={`w-8 h-8 rounded-full border text-sm font-medium transition-colors ${
                      formData.availableSlots === num.toString()
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Os membros têm que pagar */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <p className="text-sm text-cyan-800">
                Os membros têm que pagar: <span className="font-medium">R$ 6,00</span>
              </p>
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

export default CreateCustomGroupValues;
