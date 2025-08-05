import { useState } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Notificacoes = () => {
  const { notifications, stats, markAsRead, markAllAsRead, cleanDuplicateNotifications, cleanAllAndRecreate } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [isCleaning, setIsCleaning] = useState(false);
  const [isCleaningAll, setIsCleaningAll] = useState(false);

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como lida
    await markAsRead(notification.id);
    
    // Navegar para a URL de ação se existir
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleCleanDuplicates = async () => {
    setIsCleaning(true);
    try {
      const wasCleaned = await cleanDuplicateNotifications();
      if (wasCleaned) {
        // Recarregar a página apenas se houve limpeza
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao limpar duplicatas:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleCleanAll = async () => {
    if (!confirm('Tem certeza? Isso vai remover TODAS as notificações e criar apenas as essenciais.')) {
      return;
    }
    
    setIsCleaningAll(true);
    try {
      await cleanAllAndRecreate();
      // Recarregar a página para mostrar o resultado
      window.location.reload();
    } catch (error) {
      console.error('Erro ao limpar todas:', error);
    } finally {
      setIsCleaningAll(false);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-cyan-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'há pouco tempo';
    }
  };

  const filteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.is_read);
      case 'important':
        return notifications.filter(n => n.is_important);
      case 'communication':
        return notifications.filter(n => n.category === 'system');
      default:
        return notifications;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'unread':
        return stats.unread_count;
      case 'important':
        return stats.important_count;
      case 'communication':
        return notifications.filter(n => n.category === 'system').length;
      default:
        return stats.total_notifications;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Notificações</h1>
                <p className="text-sm text-gray-500">
                  {stats.total_notifications} notificação{stats.total_notifications !== 1 ? 's' : ''} no total
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {filteredNotifications().length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-sm"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
              
              {/* Botão para limpar duplicatas */}
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleCleanDuplicates}
                disabled={isCleaning}
                className="text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isCleaning ? 'Limpando...' : 'Limpar Duplicatas'}
              </Button>

              {/* Botão para limpar todas */}
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleCleanAll}
                disabled={isCleaningAll}
                className="text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isCleaningAll ? 'Limpando...' : 'Limpar Todas'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg border mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 py-4">
              <TabsList className="grid w-full grid-cols-4 h-10">
                <TabsTrigger value="all" className="text-sm font-medium">
                  Todas ({getTabCount('all')})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-sm font-medium">
                  Não Lidas ({getTabCount('unread')})
                </TabsTrigger>
                <TabsTrigger value="important" className="text-sm font-medium">
                  Importantes ({getTabCount('important')})
                </TabsTrigger>
                <TabsTrigger value="communication" className="text-sm font-medium">
                  Comunicação ({getTabCount('communication')})
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value={activeTab} className="mt-0">
              {filteredNotifications().length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhuma notificação encontrada</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {activeTab === 'all' 
                      ? 'Quando houver novidades, elas aparecerão aqui'
                      : `Não há notificações ${activeTab === 'unread' ? 'não lidas' : activeTab === 'important' ? 'importantes' : 'de comunicação'}`
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications().map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-cyan-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-base font-medium text-gray-900 mb-2">
                                {notification.title}
                              </h3>
                              
                              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">
                                  {formatDate(notification.created_at)}
                                </span>
                                
                                {notification.action_text && (
                                  <span className="text-sm text-cyan-600 font-medium hover:text-cyan-700">
                                    {notification.action_text}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {!notification.is_read && (
                              <div className="w-3 h-3 bg-cyan-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Notificacoes; 