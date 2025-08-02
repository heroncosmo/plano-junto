-- ===========================================
-- PASSO 3 FINAL: VIEWS E NOVOS SERVIÇOS
-- Execute após o PASSO 2
-- ===========================================

-- View para estatísticas de usuário
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.user_id,
  p.full_name,
  p.balance_cents,
  p.verification_status,
  COALESCE(gm_count.group_count, 0) as groups_joined,
  COALESCE(g_count.groups_created, 0) as groups_created,
  COALESCE(t_sum.total_spent_cents, 0) as total_spent_cents
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as group_count 
  FROM public.group_memberships 
  GROUP BY user_id
) gm_count ON p.user_id = gm_count.user_id
LEFT JOIN (
  SELECT admin_id, COUNT(*) as groups_created 
  FROM public.groups 
  GROUP BY admin_id
) g_count ON p.user_id = g_count.admin_id
LEFT JOIN (
  SELECT user_id, SUM(amount_cents) as total_spent_cents 
  FROM public.transactions 
  WHERE type = 'group_payment' AND status = 'completed'
  GROUP BY user_id
) t_sum ON p.user_id = t_sum.user_id;

-- View para grupos com informações completas
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

-- Adicionar novos serviços (com cast correto para enum)
INSERT INTO public.services (name, category, max_users, pre_approved, icon_url)
SELECT 
  service_name,
  service_category::service_category,
  service_max_users,
  service_pre_approved,
  service_icon_url
FROM (VALUES 
  ('YouTube Premium', 'streaming', 6, true, '/icons/youtube.svg'),
  ('Amazon Prime Video', 'streaming', 3, true, '/icons/prime.svg'),
  ('Disney+', 'streaming', 4, true, '/icons/disney.svg'),
  ('HBO Max', 'streaming', 3, true, '/icons/hbo.svg'),
  ('Paramount+', 'streaming', 6, true, '/icons/paramount.svg'),
  ('Apple TV+', 'streaming', 6, true, '/icons/appletv.svg'),
  ('Globoplay', 'streaming', 5, true, '/icons/globoplay.svg'),
  ('Crunchyroll', 'streaming', 4, true, '/icons/crunchyroll.svg'),
  ('YouTube Music', 'music', 6, true, '/icons/youtube-music.svg'),
  ('Apple Music', 'music', 6, true, '/icons/apple-music.svg'),
  ('Amazon Music', 'music', 6, true, '/icons/amazon-music.svg'),
  ('Deezer', 'music', 6, true, '/icons/deezer.svg'),
  ('Coursera', 'education', 1, true, '/icons/coursera.svg'),
  ('Duolingo Plus', 'education', 1, true, '/icons/duolingo.svg'),
  ('Skillshare', 'education', 2, true, '/icons/skillshare.svg'),
  ('Claude Pro', 'ai', 1, true, '/icons/claude.svg'),
  ('GitHub Copilot', 'ai', 1, true, '/icons/github.svg'),
  ('Microsoft 365', 'productivity', 6, true, '/icons/microsoft.svg'),
  ('Notion Pro', 'productivity', 10, true, '/icons/notion.svg'),
  ('Xbox Game Pass', 'gaming', 1, true, '/icons/xbox.svg'),
  ('PlayStation Plus', 'gaming', 1, true, '/icons/playstation.svg'),
  ('Nintendo Switch Online', 'gaming', 8, true, '/icons/nintendo.svg'),
  ('iCloud+', 'other', 6, true, '/icons/icloud.svg'),
  ('Google One', 'other', 6, true, '/icons/google.svg'),
  ('Dropbox Plus', 'other', 3, true, '/icons/dropbox.svg')
) AS new_services(service_name, service_category, service_max_users, service_pre_approved, service_icon_url)
WHERE NOT EXISTS (
  SELECT 1 FROM public.services 
  WHERE services.name = new_services.service_name
);

-- Contar serviços para verificação
SELECT 'Passo 3 completo!' as status, COUNT(*) as total_services FROM public.services;