-- ===========================================
-- SISTEMA DE NOTIFICAÇÕES - SETUP
-- ===========================================

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  category TEXT NOT NULL DEFAULT 'general', -- 'general', 'group', 'payment', 'system'
  is_read BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  action_url TEXT, -- URL para ação quando clicado
  action_text TEXT, -- Texto do botão de ação
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);

-- Função para marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_as_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE id = notification_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Função para marcar todas as notificações do usuário como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications 
  SET is_read = TRUE, updated_at = NOW()
  WHERE user_id = user_uuid AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  user_uuid UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'info',
  notification_category TEXT DEFAULT 'general',
  is_important_param BOOLEAN DEFAULT FALSE,
  action_url_param TEXT DEFAULT NULL,
  action_text_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    category,
    is_important,
    action_url,
    action_text
  ) VALUES (
    user_uuid,
    notification_title,
    notification_message,
    notification_type,
    notification_category,
    is_important_param,
    action_url_param,
    action_text_param
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- View para estatísticas de notificações
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  user_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
  COUNT(*) FILTER (WHERE is_important = TRUE) as important_count,
  COUNT(*) FILTER (WHERE is_important = TRUE AND is_read = FALSE) as unread_important_count
FROM public.notifications
GROUP BY user_id;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_updated_at_trigger
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_updated_at();

-- Políticas de segurança RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas notificações
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários atualizarem apenas suas notificações
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para sistema criar notificações
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- NOTA: As notificações de exemplo serão criadas programaticamente
-- quando o usuário fizer login pela primeira vez ou quando necessário 