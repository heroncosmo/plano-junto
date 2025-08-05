import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'general' | 'group' | 'payment' | 'system';
  is_read: boolean;
  is_important: boolean;
  action_url?: string;
  action_text?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  important_count: number;
  unread_important_count: number;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total_notifications: 0,
    unread_count: 0,
    important_count: 0,
    unread_important_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Carregar notificações do usuário
  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Notificações carregadas:', data?.length || 0);
      setNotifications(data || []);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas de notificações
  const loadNotificationStats = async () => {
    if (!user) return;

    try {
      // Calcular estatísticas diretamente da tabela notifications
      const { data: allNotifications, error } = await supabase
        .from('notifications')
        .select('id, is_read, is_important')
        .eq('user_id', user.id);

      if (error) throw error;

      const total_notifications = allNotifications?.length || 0;
      const unread_count = allNotifications?.filter(n => !n.is_read).length || 0;
      const important_count = allNotifications?.filter(n => n.is_important).length || 0;
      const unread_important_count = allNotifications?.filter(n => n.is_important && !n.is_read).length || 0;

      setStats({
        total_notifications,
        unread_count,
        important_count,
        unread_important_count
      });

      console.log('Estatísticas calculadas:', {
        total_notifications,
        unread_count,
        important_count,
        unread_important_count
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas de notificações:', err);
      // Em caso de erro, definir estatísticas padrão
      setStats({
        total_notifications: 0,
        unread_count: 0,
        important_count: 0,
        unread_important_count: 0
      });
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('mark_notification_as_read', { notification_id: notificationId });

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );

      // Recarregar estatísticas
      await loadNotificationStats();
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('mark_all_notifications_as_read', { user_uuid: user.id });

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      // Recarregar estatísticas
      await loadNotificationStats();
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
    }
  };

  // Criar nova notificação (para uso interno do sistema)
  const createNotification = async (
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    category: Notification['category'] = 'general',
    isImportant: boolean = false,
    actionUrl?: string,
    actionText?: string
  ) => {
    if (!user) return;

    try {
      // Verificar se já existe uma notificação idêntica recente (últimas 5 minutos)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: existingNotifications, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', title)
        .eq('message', message)
        .gte('created_at', fiveMinutesAgo);

      if (checkError) {
        console.error('Erro ao verificar notificações existentes:', checkError);
      } else if (existingNotifications && existingNotifications.length > 0) {
        console.log('Notificação idêntica já existe, evitando duplicação:', title);
        return existingNotifications[0].id; // Retornar o ID da notificação existente
      }

      const { data, error } = await supabase
        .rpc('create_notification', {
          user_uuid: user.id,
          notification_title: title,
          notification_message: message,
          notification_type: type,
          notification_category: category,
          is_important_param: isImportant,
          action_url_param: actionUrl,
          action_text_param: actionText
        });

      if (error) throw error;

      // Recarregar notificações e estatísticas
      await loadNotifications();
      await loadNotificationStats();

      return data;
    } catch (err) {
      console.error('Erro ao criar notificação:', err);
      throw err;
    }
  };

  // Criar notificações de exemplo para novos usuários
  const createSampleNotifications = async () => {
    if (!user) return;

    try {
      // Verificar se o usuário já tem notificações realistas
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id, title')
        .eq('user_id', user.id);

      // Se já tem notificações realistas, não criar exemplos
      const hasRealisticNotifications = existingNotifications?.some(notification => 
        notification.title === 'Bem-vindo ao JuntaPlay!' ||
        notification.title === 'Como funciona o JuntaPlay?' ||
        notification.title === 'Adicione créditos para participar'
      );

      if (hasRealisticNotifications) {
        return;
      }

      // Limpar notificações antigas (fictícias) se existirem
      if (existingNotifications && existingNotifications.length > 0) {
        await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id);
      }

             // Criar notificações de exemplo para novos usuários
       const sampleNotifications = [
         {
           title: 'Bem-vindo ao JuntaPlay!',
           message: 'Agora você pode criar grupos, participar de outros grupos e começar a economizar junto com outras pessoas.',
           type: 'success' as const,
           category: 'general' as const,
           isImportant: true,
           actionUrl: '/grupos',
           actionText: 'Explorar Grupos'
         },
         {
           title: 'Como funciona o JuntaPlay?',
           message: 'Crie ou participe de grupos para dividir custos. Cada grupo tem um valor específico e você pode economizar muito!',
           type: 'info' as const,
           category: 'general' as const,
           isImportant: false,
           actionUrl: '/ajuda',
           actionText: 'Ver Ajuda'
         },
         {
           title: 'Adicione créditos para participar',
           message: 'Para participar de grupos, você precisa ter créditos suficientes. Adicione créditos agora e comece a economizar!',
           type: 'info' as const,
           category: 'payment' as const,
           isImportant: false,
           actionUrl: '/creditos',
           actionText: 'Adicionar Créditos'
         }
       ];

      // Criar todas as notificações de uma vez
      const notificationPromises = sampleNotifications.map(notification => 
        supabase.rpc('create_notification', {
          user_uuid: user.id,
          notification_title: notification.title,
          notification_message: notification.message,
          notification_type: notification.type,
          notification_category: notification.category,
          is_important_param: notification.isImportant,
          action_url_param: notification.actionUrl,
          action_text_param: notification.actionText
        })
      );

      await Promise.all(notificationPromises);

      console.log('Notificações de exemplo criadas com sucesso');
    } catch (err) {
      console.error('Erro ao criar notificações de exemplo:', err);
    }
  };

  // Função para limpar completamente e recriar apenas notificações essenciais
  const cleanAllAndRecreate = async () => {
    if (!user) return;
    
    try {
      console.log('Iniciando limpeza completa de notificações...');
      
      // Deletar todas as notificações do usuário
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Erro ao deletar notificações:', deleteError);
        return;
      }

      console.log('Todas as notificações deletadas, criando apenas as essenciais...');

      // Criar apenas as notificações essenciais
      const essentialNotifications = [
        {
          title: 'Bem-vindo ao JuntaPlay!',
          message: 'Agora você pode criar grupos, participar de outros grupos e começar a economizar junto com outras pessoas.',
          type: 'success' as const,
          category: 'general' as const,
          isImportant: true,
          actionUrl: '/grupos',
          actionText: 'Explorar Grupos'
        },
        {
          title: 'Como funciona o JuntaPlay?',
          message: 'Crie ou participe de grupos para dividir custos. Cada grupo tem um valor específico e você pode economizar muito!',
          type: 'info' as const,
          category: 'general' as const,
          isImportant: false,
          actionUrl: '/ajuda',
          actionText: 'Ver Ajuda'
        },
        {
          title: 'Adicione créditos para participar',
          message: 'Para participar de grupos, você precisa ter créditos suficientes. Adicione créditos agora e comece a economizar!',
          type: 'info' as const,
          category: 'payment' as const,
          isImportant: false,
          actionUrl: '/creditos',
          actionText: 'Adicionar Créditos'
        }
      ];

      // Criar apenas as notificações essenciais
      const notificationPromises = essentialNotifications.map(notification => 
        supabase.rpc('create_notification', {
          user_uuid: user.id,
          notification_title: notification.title,
          notification_message: notification.message,
          notification_type: notification.type,
          notification_category: notification.category,
          is_important_param: notification.isImportant,
          action_url_param: notification.actionUrl,
          action_text_param: notification.actionText
        })
      );

      await Promise.all(notificationPromises);
      console.log('Limpeza completa realizada. Apenas 3 notificações essenciais criadas.');
      
      // Recarregar notificações
      await loadNotifications();
      await loadNotificationStats();
    } catch (err) {
      console.error('Erro na limpeza completa:', err);
    }
  };

  // Função para limpar notificações duplicadas
  const cleanDuplicateNotifications = async () => {
    if (!user) return;
    
    try {
      const { data: allNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Total de notificações antes da limpeza:', allNotifications?.length || 0);

      // Agrupar por título e manter apenas a mais recente
      const uniqueNotifications = new Map();
      
      allNotifications?.forEach(notification => {
        const key = `${notification.title}-${notification.message}`; // Chave mais específica
        if (!uniqueNotifications.has(key) || 
            new Date(notification.created_at) > new Date(uniqueNotifications.get(key).created_at)) {
          uniqueNotifications.set(key, notification);
        }
      });

      console.log('Notificações únicas encontradas:', uniqueNotifications.size);

      // Se há duplicatas, limpar e recriar
      if (uniqueNotifications.size < allNotifications.length) {
        console.log('Encontradas notificações duplicadas, limpando...');
        
        // Deletar todas as notificações do usuário
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Erro ao deletar notificações:', deleteError);
          return false;
        }

        console.log('Todas as notificações deletadas, recriando únicas...');

        // Recriar apenas as únicas
        const uniqueNotificationsArray = Array.from(uniqueNotifications.values());
        const notificationPromises = uniqueNotificationsArray.map(notification => 
          supabase.rpc('create_notification', {
            user_uuid: user.id,
            notification_title: notification.title,
            notification_message: notification.message,
            notification_type: notification.type,
            notification_category: notification.category,
            is_important_param: notification.is_important,
            action_url_param: notification.action_url,
            action_text_param: notification.action_text
          })
        );

        await Promise.all(notificationPromises);
        console.log('Notificações duplicadas removidas. Total final:', uniqueNotifications.size);
        
        // Recarregar notificações após limpeza
        await loadNotifications();
        await loadNotificationStats();
        
        return true; // Indica que limpeza foi feita
      } else {
        console.log('Nenhuma duplicata encontrada, mantendo notificações atuais');
        return false; // Indica que não houve limpeza
      }
    } catch (err) {
      console.error('Erro ao limpar notificações duplicadas:', err);
      return false;
    }
  };

  // Função de debug para verificar notificações
  const debugNotifications = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao verificar notificações:', error);
        return;
      }
      
      console.log('Debug - Total de notificações no banco:', data?.length || 0);
      console.log('Debug - Notificações:', data);
      console.log('Debug - Estado atual das notificações:', notifications.length);
    } catch (err) {
      console.error('Erro no debug:', err);
    }
  };

  // Carregar dados quando usuário mudar
  useEffect(() => {
    if (user && !initialized) {
      const initializeNotifications = async () => {
        try {
          console.log('Inicializando notificações para o usuário...');
          
          // Apenas carregar notificações existentes - NÃO criar novas automaticamente
          await loadNotifications();
          await loadNotificationStats();
          
          console.log('Notificações carregadas com sucesso');
          
          // Marcar como inicializado
          setInitialized(true);
        } catch (err) {
          console.error('Erro na inicialização das notificações:', err);
          setInitialized(true); // Marcar como inicializado mesmo com erro
        }
      };
      
      initializeNotifications();
    } else if (!user) {
      setNotifications([]);
      setStats({
        total_notifications: 0,
        unread_count: 0,
        important_count: 0,
        unread_important_count: 0
      });
      setInitialized(false);
    }
  }, [user, initialized]);

  // Função para recarregar notificações manualmente
  const refreshNotifications = async () => {
    if (!user) return;
    
    setInitialized(false);
    await loadNotifications();
    await loadNotificationStats();
    setInitialized(true);
  };

  return {
    notifications,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    createNotification,
    createSampleNotifications,
    loadNotifications,
    loadNotificationStats,
    debugNotifications,
    cleanDuplicateNotifications,
    refreshNotifications,
    cleanAllAndRecreate
  };
}; 