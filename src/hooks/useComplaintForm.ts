import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface ComplaintFormData {
  groupId?: string;
  problemType?: string;
  problemDescription?: string;
  desiredSolution?: string;
  contactedAdmin?: boolean;
}

export const useComplaintForm = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<ComplaintFormData>({});
  const [isNewComplaint, setIsNewComplaint] = useState(true);

  // Verificar se é uma nova reclamação baseado no timestamp da URL
  useEffect(() => {
    const timestamp = searchParams.get('t');
    const currentTime = Date.now();
    
    // Se não há timestamp ou se passou mais de 5 minutos, é uma nova reclamação
    if (!timestamp || (currentTime - parseInt(timestamp)) > 5 * 60 * 1000) {
      setIsNewComplaint(true);
      clearFormData();
    } else {
      setIsNewComplaint(false);
    }
  }, [searchParams]);

  // Limpar dados do formulário
  const clearFormData = () => {
    setFormData({
      groupId: searchParams.get('groupId') || undefined
    });
  };

  // Atualizar dados do formulário
  const updateFormData = (data: Partial<ComplaintFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Verificar se é uma nova reclamação
  const checkIfNewComplaint = () => {
    const timestamp = searchParams.get('t');
    const currentTime = Date.now();
    
    if (!timestamp || (currentTime - parseInt(timestamp)) > 5 * 60 * 1000) {
      clearFormData();
      return true;
    }
    return false;
  };

  return {
    formData,
    isNewComplaint,
    updateFormData,
    clearFormData,
    checkIfNewComplaint
  };
}; 