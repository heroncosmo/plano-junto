import { useState } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const { notifications, stats, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como lida
    await markAsRead(notification.id);
    
    // Navegar para a URL de ação se existir
    if (notification.action_url) {
      navigate(notification.action_url);
      onClose();
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-cyan-500" />;
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
      case 'important':
        return stats.important_count;
      case 'communication':
        return notifications.filter(n => n.category === 'system').length;
      default:
        return stats.total_notifications;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay para fechar quando clicar fora */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}
      
             {/* Panel */}
       <div className="absolute top-full right-0 mt-2 z-50">
         <div className="w-80 max-h-80 bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-white">
          <h2 className="text-base font-medium text-gray-900">Notificações</h2>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                navigate('/notificacoes');
                onClose();
              }}
                              className="h-6 px-2 text-xs text-cyan-600 hover:bg-cyan-50"
            >
              Ver todas
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 hover:bg-gray-100">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-white">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-3 py-2">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="all" className="text-xs">
                  Todas ({getTabCount('all')})
                </TabsTrigger>
                <TabsTrigger value="important" className="text-xs">
                  Importantes ({getTabCount('important')})
                </TabsTrigger>
                <TabsTrigger value="communication" className="text-xs">
                  Comunicação ({getTabCount('communication')})
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <Tabs value={activeTab} className="h-full">
            <TabsContent value={activeTab} className="mt-0 h-full">
              <div className="p-3">
                {filteredNotifications().length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm font-medium">Nenhuma notificação encontrada</p>
                    <p className="text-xs text-gray-400 mt-1">Quando houver novidades, elas aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                                         {filteredNotifications().map((notification) => (
                       <div
                         key={notification.id}
                         className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                           !notification.is_read ? 'bg-cyan-50' : ''
                         }`}
                         onClick={() => handleNotificationClick(notification)}
                       >
                         <div className="flex items-start gap-2">
                           <div className="flex-shrink-0 mt-0.5">
                             {getNotificationIcon(notification.type)}
                           </div>
                           
                           <div className="flex-1 min-w-0">
                             <div className="flex items-start justify-between gap-2">
                               <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                 {notification.title}
                               </h3>
                               {!notification.is_read && (
                                 <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1" />
                               )}
                             </div>
                             
                             <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                               {notification.message}
                             </p>
                             
                             <div className="flex items-center justify-between mt-2">
                               <span className="text-xs text-gray-400">
                                 {formatDate(notification.created_at)}
                               </span>
                               
                               {notification.action_text && (
                                 <span className="text-xs text-cyan-600 font-medium">
                                   {notification.action_text}
                                 </span>
                               )}
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        {filteredNotifications().length > 0 && (
          <div className="p-3 border-t bg-white">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full h-8 text-xs text-gray-600 hover:bg-gray-50"
              onClick={markAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default NotificationPanel; 