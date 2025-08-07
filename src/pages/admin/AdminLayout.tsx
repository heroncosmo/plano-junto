import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Crown, 
  DollarSign, 
  Wallet, 
  MessageSquare,
  BarChart3,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin-config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminStatus = isAdmin(user?.email);

  if (!adminStatus) {
    return null;
  }

  const menuItems = [
    {
      path: '/admin',
      label: 'Visão Geral',
      icon: BarChart3,
      description: 'Estatísticas do sistema'
    },
    {
      path: '/admin/clients',
      label: 'Clientes',
      icon: Users,
      description: 'Gerenciar clientes'
    },
    {
      path: '/admin/transactions',
      label: 'Transações',
      icon: FileText,
      description: 'Histórico de transações'
    },
    {
      path: '/admin/groups',
      label: 'Grupos',
      icon: Crown,
      description: 'Aprovar grupos'
    },
    {
      path: '/admin/withdrawals',
      label: 'Saques',
      icon: DollarSign,
      description: 'Processar saques'
    },
    {
      path: '/admin/complaints',
      label: 'Reclamações',
      icon: MessageSquare,
      description: 'Sistema de mediação'
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-sm text-gray-600">Gerencie o sistema JuntaPlay</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Admin
            </Badge>
          </div>

          {/* Navigation Menu */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Card 
                  key={item.path}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <h3 className={`font-semibold text-sm ${
                      isActive ? 'text-blue-800' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow-sm border">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLayout; 