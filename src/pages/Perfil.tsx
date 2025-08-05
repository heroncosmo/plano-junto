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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, User, Mail, Phone, Shield, CheckCircle, XCircle, AlertCircle, CreditCard, Loader2, Info, Lock, MapPin, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/integrations/supabase/functions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Perfil = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    cpf: '',
    phone: '',
    address_street: '',
    address_number: '',
    address_city: '',
    address_state: '',
    address_zipcode: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 DEBUG - Carregando perfil para usuário:', user?.id);
      
      const profileData = await getUserProfile();
      console.log('🔍 DEBUG - Dados do perfil recebidos:', profileData);
      
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
          address_zipcode: profileData.address_zipcode || ''
        });
      } else {
        // Se não há perfil, criar um básico com dados do usuário
        console.log('🔍 DEBUG - Nenhum perfil encontrado, criando perfil básico');
        const basicProfile = {
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
          cpf: '',
          phone: '',
          address_street: '',
          address_number: '',
          address_city: '',
          address_state: '',
          address_zipcode: '',
          created_at: new Date().toISOString()
        };
        setProfile(basicProfile);
        setFormData({
          full_name: basicProfile.full_name,
          cpf: '',
          phone: '',
          address_street: '',
          address_number: '',
          address_city: '',
          address_state: '',
          address_zipcode: ''
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados. Tentando criar perfil básico...",
        variant: "destructive",
      });
      
      // Criar perfil básico em caso de erro
      const basicProfile = {
        full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
        cpf: '',
        phone: '',
        address_street: '',
        address_number: '',
        address_city: '',
        address_state: '',
        address_zipcode: '',
        created_at: new Date().toISOString()
      };
      setProfile(basicProfile);
      setFormData({
        full_name: basicProfile.full_name,
        cpf: '',
        phone: '',
        address_street: '',
        address_number: '',
        address_city: '',
        address_state: '',
        address_zipcode: ''
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
      console.log('🔍 DEBUG - Salvando perfil:', formData);
      
      await updateUserProfile(formData);
      setIsEditing(false);
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
      await loadProfile(); // Recarregar dados
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('❌ Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
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
      fiscal: { verified: !!profile?.cpf, text: profile?.cpf ? 'Verificado' : 'Não cadastrado' }
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

  const formatCPF = (cpf: string) => {
    if (!cpf) return '';
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (cep: string) => {
    if (!cep) return '';
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-500" />
              <p className="text-gray-600">Carregando seu perfil...</p>
            </div>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dados Fiscais
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="personal" className="space-y-6">
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
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label>Membro desde</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Data não disponível'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  {isEditing ? (
                    <>
                      <Button 
                        onClick={handleSave} 
                        className="bg-cyan-500 hover:bg-cyan-600"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          'Salvar Alterações'
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => setIsEditing(true)}>
                        Editar Perfil
                      </Button>
                      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Lock className="h-4 w-4 mr-2" />
                            Alterar Senha
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Alterar Senha</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="newPassword">Nova Senha</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                placeholder="Digite sua nova senha"
                              />
                            </div>
                            <div>
                              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirme sua nova senha"
                              />
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button 
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="flex-1"
                              >
                                {changingPassword ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Alterando...
                                  </>
                                ) : (
                                  'Alterar Senha'
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setShowPasswordModal(false)}
                                disabled={changingPassword}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
                    <span className={`text-sm ${getVerificationColor(true)}`}>
                      {getVerificationStatus('email').text}
                    </span>
                    {getVerificationIcon(true)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Telefone</p>
                      <p className="text-sm text-gray-600">{formData.phone || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getVerificationColor(!!formData.phone)}`}>
                      {getVerificationStatus('phone').text}
                    </span>
                    {getVerificationIcon(!!formData.phone)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dados Fiscais */}
          <TabsContent value="fiscal" className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Esses dados são de preenchimento obrigatório para administradores. São necessários para a emissão de Nota Fiscal pelo Kotas, para pagamento em boletos registrados e para ativação da funcionalidade do Pix Programado.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Dados Fiscais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="cpf"
                      value={formatCPF(formData.cpf)}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        if (cleaned.length <= 11) {
                          handleInputChange('cpf', cleaned);
                        }
                      }}
                      disabled={!isEditing}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    {!isEditing && (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Alterar
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address_street">Endereço</Label>
                  <Input
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => handleInputChange('address_street', e.target.value)}
                    disabled={!isEditing}
                    className="mt-1"
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address_number">Número</Label>
                    <Input
                      id="address_number"
                      value={formData.address_number}
                      onChange={(e) => handleInputChange('address_number', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_zipcode">CEP</Label>
                    <Input
                      id="address_zipcode"
                      value={formatCEP(formData.address_zipcode)}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        if (cleaned.length <= 8) {
                          handleInputChange('address_zipcode', cleaned);
                        }
                      }}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address_city">Cidade</Label>
                    <Input
                      id="address_city"
                      value={formData.address_city}
                      onChange={(e) => handleInputChange('address_city', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_state">Estado</Label>
                    <Input
                      id="address_state"
                      value={formData.address_state}
                      onChange={(e) => handleInputChange('address_state', e.target.value)}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="SP"
                    />
                  </div>
                </div>



                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSave} 
                      className="bg-cyan-500 hover:bg-cyan-600"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Dados Fiscais'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status dos Dados Fiscais */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Dados Fiscais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">CPF</p>
                      <p className="text-sm text-gray-600">
                        {formData.cpf ? formatCPF(formData.cpf) : 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getVerificationColor(!!formData.cpf)}`}>
                      {getVerificationStatus('fiscal').text}
                    </span>
                    {getVerificationIcon(!!formData.cpf)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Endereço</p>
                      <p className="text-sm text-gray-600">
                        {formData.address_street && formData.address_number 
                          ? `${formData.address_street}, ${formData.address_number}` 
                          : 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${getVerificationColor(!!(formData.address_street && formData.address_number))}`}>
                      {formData.address_street && formData.address_number ? 'Completo' : 'Incompleto'}
                    </span>
                    {getVerificationIcon(!!(formData.address_street && formData.address_number))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Senha</p>
                      <p className="text-sm text-gray-600">Última alteração: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR') : 'Não disponível'}</p>
                    </div>
                  </div>
                  <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Alterar Senha
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Alterar Senha</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="newPassword">Nova Senha</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Digite sua nova senha"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirme sua nova senha"
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button 
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className="flex-1"
                          >
                            {changingPassword ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Alterando...
                              </>
                            ) : (
                              'Alterar Senha'
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowPasswordModal(false)}
                            disabled={changingPassword}
                          >
                            Cancelar
                          </Button>
                                                 </div>
                       </div>
                     </DialogContent>
                   </Dialog>
                 </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sidebar */}
        <div className="mt-8 space-y-6">
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Perfil; 