import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, User, Mail, Phone, Shield, CheckCircle, XCircle, AlertCircle, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';

const Perfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    phone: '',
    address_street: '',
    address_number: '',
    address_city: '',
    address_state: '',
    address_zipcode: '',
    pix_key: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await getUserProfile();
      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || '',
          cpf: profileData.cpf || '',
          phone: profileData.phone || '',
          address_street: profileData.address_street || '',
          address_number: profileData.address_number || '',
          address_city: profileData.address_city || '',
          address_state: profileData.address_state || '',
          address_zipcode: profileData.address_zipcode || '',
          pix_key: profileData.pix_key || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateUserProfile(formData);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
      await loadProfile(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    // Implementar modal ou navegação para alterar senha
    alert('Funcionalidade de alterar senha será implementada');
  };

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  const getVerificationStatus = (type: string) => {
    const statuses = {
      email: { verified: true, text: 'Verificado' },
      phone: { verified: !!profile?.phone, text: profile?.phone ? 'Verificado' : 'Não verificado' },
      identity: { verified: profile?.verification_status === 'verified', text: profile?.verification_status === 'verified' ? 'Verificado' : 'Pendente' },
      fiscal: { verified: false, text: 'Não cadastrado' }
    };
    return statuses[type as keyof typeof statuses];
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getVerificationColor = (verified: boolean) => {
    return verified ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 p-0 h-auto text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Pessoais */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled={true}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">O email não pode ser alterado</p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Membro desde</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Carregando...'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-600">
                        Salvar Alterações
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => setIsEditing(true)}>
                        Editar Perfil
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleChangePassword}
                      >
                        Alterar Senha
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dados Cadastrais */}
            <Card>
              <CardHeader>
                <CardTitle>Dados Cadastrais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">E-mail</p>
                      <p className="text-sm text-gray-600">{user?.email || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getVerificationColor(false)}`}>
                      {getVerificationStatus('email').text}
                    </span>
                    {getVerificationIcon(false)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-sm text-gray-600">{formData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getVerificationColor(false)}`}>
                      {getVerificationStatus('phone').text}
                    </span>
                    {getVerificationIcon(false)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Gmail</p>
                      <p className="text-sm text-gray-600">Conectado</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getVerificationColor(true)}`}>
                      {getVerificationStatus('gmail').text}
                    </span>
                    {getVerificationIcon(true)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Dados Fiscais</p>
                      <p className="text-sm text-gray-600">CPF e informações fiscais</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getVerificationColor(false)}`}>
                      {getVerificationStatus('fiscal').text}
                    </span>
                    {getVerificationIcon(false)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Conquistas */}
            <Card>
              <CardHeader>
                <CardTitle>Conquistas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🏆</div>
                  <p className="text-sm text-gray-600 mb-2">
                    Parece que você ainda não tem selos!
                  </p>
                  <p className="text-xs text-gray-500">
                    Selos são uma maneira de identificar bons grupos e administradores,{' '}
                    <button className="text-cyan-600 hover:underline">
                      clique aqui
                    </button>{' '}
                    para saber mais.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/creditos')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ver Meus Créditos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/my-groups')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Meus Grupos
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/ajuda')}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Central de Ajuda
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Perfil; 