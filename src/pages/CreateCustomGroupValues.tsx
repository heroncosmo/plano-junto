import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

const CreateCustomGroupValues = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData: initialFormData } = location.state || {};

  const [formData, setFormData] = useState({
    ...initialFormData,
    serviceCost: initialFormData?.serviceCost || '',
    totalSlots: initialFormData?.totalSlots || '',
    reservedSlots: initialFormData?.reservedSlots || '1',
    customSlots: initialFormData?.customSlots || false,
    customSlotsValue: initialFormData?.customSlotsValue || '',
    customReserved: initialFormData?.customReserved || false,
    customReservedValue: initialFormData?.customReservedValue || ''
  });

  const [errors, setErrors] = useState({
    serviceCost: '',
    totalSlots: '',
    reservedSlots: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset custom fields when selecting predefined options
      ...(field === 'totalSlots' && value !== 'true' ? { customSlots: false, customSlotsValue: '' } : {}),
      ...(field === 'reservedSlots' && value !== 'true' ? { customReserved: false, customReservedValue: '' } : {})
    }));
  };

  // Calculate price per member
  const calculatePricePerMember = () => {
    const serviceCost = parseFloat(formData.serviceCost) || 0;
    const totalSlots = formData.customSlots ?
      parseInt(formData.customSlotsValue) || 0 :
      parseInt(formData.totalSlots) || 0;
    const reservedSlots = formData.customReserved ?
      parseInt(formData.customReservedValue) || 0 :
      parseInt(formData.reservedSlots) || 0;

    const availableSlots = totalSlots - reservedSlots;
    if (availableSlots <= 0) return 0;

    return (serviceCost / availableSlots).toFixed(2);
  };

  const handleBack = () => {
    navigate('/create-group/custom/fidelity', { state: { formData } });
  };

  const validateForm = () => {
    const newErrors = {
      serviceCost: '',
      totalSlots: '',
      reservedSlots: ''
    };

    if (!formData.serviceCost || parseFloat(formData.serviceCost) <= 0) {
      newErrors.serviceCost = 'Por favor, preencha um valor válido para o serviço';
    }

    if (!formData.totalSlots && !formData.customSlots) {
      newErrors.totalSlots = 'Por favor, selecione o número de vagas totais';
    }

    if (formData.customSlots && (!formData.customSlotsValue || parseInt(formData.customSlotsValue) <= 0)) {
      newErrors.totalSlots = 'Por favor, preencha um número válido de vagas totais';
    }

    if (!formData.reservedSlots && !formData.customReserved) {
      newErrors.reservedSlots = 'Por favor, selecione o número de vagas reservadas';
    }

    if (formData.customReserved && (!formData.customReservedValue || parseInt(formData.customReservedValue) <= 0)) {
      newErrors.reservedSlots = 'Por favor, preencha um número válido de vagas reservadas';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    navigate('/create-group/custom/summary', {
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
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
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
                  value={formData.serviceCost}
                  onChange={(e) => handleInputChange('serviceCost', e.target.value)}
                />
              </div>
            </div>

            {/* Vagas totais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vagas totais
              </label>
              <div className="flex flex-wrap gap-2">
                {[3,4,5,6,7,8,9,10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInputChange('totalSlots', num.toString())}
                    className={`w-8 h-8 rounded-full border text-sm font-medium transition-colors ${
                      formData.totalSlots === num.toString()
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleInputChange('customSlots', 'true')}
                  className={`w-8 h-8 rounded-full border text-sm font-medium transition-colors ${
                    formData.customSlots
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                  }`}
                >
                  +
                </button>
              </div>
              {formData.customSlots && (
                <div className="mt-2">
                  <Input
                    type="number"
                    placeholder="Número personalizado"
                    value={formData.customSlotsValue}
                    onChange={(e) => handleInputChange('customSlotsValue', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </div>

            {/* Quantas serão reservadas para você? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantas serão reservadas para você?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInputChange('reservedSlots', num.toString())}
                    className={`w-8 h-8 rounded-full border text-sm font-medium transition-colors ${
                      formData.reservedSlots === num.toString()
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleInputChange('customReserved', 'true')}
                  className={`w-8 h-8 rounded-full border text-sm font-medium transition-colors ${
                    formData.customReserved
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-500'
                  }`}
                >
                  +
                </button>
              </div>
              {formData.customReserved && (
                <div className="mt-2">
                  <Input
                    type="number"
                    placeholder="Número personalizado"
                    value={formData.customReservedValue}
                    onChange={(e) => handleInputChange('customReservedValue', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </div>

            {/* Os membros têm que pagar */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <p className="text-sm text-cyan-800">
                Os membros têm que pagar:
                <br />
                <span className="font-medium">R$ {calculatePricePerMember()}</span>
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
