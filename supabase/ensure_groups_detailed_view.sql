-- Garantir que a view groups_detailed existe com o admin_name
-- Execute este SQL no Supabase para corrigir a listagem de grupos

DROP VIEW IF EXISTS groups_detailed;

CREATE OR REPLACE VIEW groups_detailed AS
SELECT 
  g.*,
  s.name as service_name,
  s.category as service_category,
  s.icon_url as service_icon,
  p.full_name as admin_name,
  CASE 
    WHEN g.current_members >= g.max_members THEN 'full'
    WHEN g.current_members = 0 THEN 'empty'
    ELSE 'available'
  END as availability_status
FROM public.groups g
JOIN public.services s ON g.service_id = s.id
JOIN public.profiles p ON g.admin_id = p.user_id;

-- Verificar se a view foi criada corretamente
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'groups_detailed' 
ORDER BY ordinal_position; 