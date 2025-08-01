-- Seed data para grupos de teste no marketplace de cotas
-- Inserir dados de grupos populares com assinaturas compartilhadas

-- Primeiro, vamos garantir que temos algumas categorias
INSERT INTO categories (name, description, icon) VALUES
('IA & Produtividade', 'Ferramentas de inteligência artificial e produtividade', '🤖'),
('Streaming', 'Plataformas de vídeo e música', '🎬'),
('Jogos', 'Plataformas de jogos e entretenimento', '🎮'),
('Design & Criatividade', 'Ferramentas de design e criação', '🎨'),
('Educação', 'Cursos e plataformas educacionais', '📚'),
('Software', 'Softwares e aplicativos diversos', '💻')
ON CONFLICT (name) DO NOTHING;

-- Inserir grupos de teste populares
INSERT INTO groups (
  title, 
  description, 
  category_id, 
  total_spots, 
  available_spots, 
  price_per_person, 
  total_price,
  admin_user_id,
  expires_at,
  image_url,
  status,
  features
) VALUES

-- Grupos de IA & Produtividade
(
  'ChatGPT Plus + Claude Pro + Gemini Advanced - Pack IA Completo',
  'Acesso premium aos 3 melhores assistentes de IA do mercado! ChatGPT Plus ($20), Claude Pro ($20) e Gemini Advanced ($19.99). Perfeito para estudantes, profissionais e desenvolvedores que querem o melhor da IA.',
  (SELECT id FROM categories WHERE name = 'IA & Produtividade'),
  4, 2, 59.90, 239.60,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '15 days',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
  'active',
  ARRAY['ChatGPT Plus - $20/mês', 'Claude Pro - $20/mês', 'Gemini Advanced - $19.99/mês', 'Acesso premium a todos', 'Suporte 24/7']
),

(
  'Notion Pro + Obsidian Sync - Organização Total',
  'Combo perfeito para organização e produtividade. Notion Pro para gestão de projetos e Obsidian Sync para anotações conectadas. Ideal para estudantes e profissionais.',
  (SELECT id FROM categories WHERE name = 'IA & Produtividade'),
  5, 3, 24.90, 124.50,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '20 days',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400',
  'active',
  ARRAY['Notion Pro - Unlimited', 'Obsidian Sync', 'Templates premium', 'Integrações avançadas']
),

-- Grupos de Streaming
(
  'Netflix Premium + Disney+ + HBO Max - Combo Streaming',
  'O melhor combo de streaming! Netflix Premium 4K, Disney+ com todo catálogo Marvel/Star Wars e HBO Max com filmes em estreia. Entretenimento garantido para toda família.',
  (SELECT id FROM categories WHERE name = 'Streaming'),
  4, 1, 67.50, 270.00,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '25 days',
  'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400',
  'active',
  ARRAY['Netflix Premium 4K', 'Disney+ Premium', 'HBO Max', '4 telas simultâneas', 'Catálogo completo']
),

(
  'Spotify Premium Family + YouTube Music',
  'Música sem limites! Spotify Premium Family para até 6 contas + YouTube Music Premium. Escute offline, sem anúncios e com qualidade máxima.',
  (SELECT id FROM categories WHERE name = 'Streaming'),
  6, 4, 18.90, 113.40,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '18 days',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
  'active',
  ARRAY['Spotify Premium Family', 'YouTube Music Premium', '6 contas separadas', 'Download offline', 'Sem anúncios']
),

-- Grupos de Jogos
(
  'Xbox Game Pass Ultimate + PlayStation Plus Extra',
  'O melhor dos dois mundos! Xbox Game Pass Ultimate com mais de 100 jogos + PlayStation Plus Extra. Inclui jogos day-one e clássicos remasterizados.',
  (SELECT id FROM categories WHERE name = 'Jogos'),
  3, 1, 89.90, 269.70,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '12 days',
  'https://images.unsplash.com/photo-1606318664588-f04fcec5f817?w=400',
  'active',
  ARRAY['Xbox Game Pass Ultimate', 'PlayStation Plus Extra', '100+ jogos Xbox', '400+ jogos PlayStation', 'Jogos day-one']
),

(
  'Steam + Epic Games - Biblioteca Completa',
  'Acesso às melhores bibliotecas de jogos PC. Compartilhamento de jogos Steam + jogos grátis Epic Games toda semana. Ideal para gamers.',
  (SELECT id FROM categories WHERE name = 'Jogos'),
  2, 0, 45.00, 90.00,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '8 days',
  'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400',
  'active',
  ARRAY['Biblioteca Steam compartilhada', 'Epic Games grátis semanais', '500+ jogos disponíveis', 'Multiplayer online']
),

-- Grupos de Design
(
  'Adobe Creative Cloud + Canva Pro',
  'Combo completo para designers! Adobe Creative Cloud completo (Photoshop, Illustrator, After Effects, etc.) + Canva Pro. Tudo que você precisa para criar.',
  (SELECT id FROM categories WHERE name = 'Design & Criatividade'),
  5, 2, 89.90, 449.50,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '30 days',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
  'active',
  ARRAY['Adobe Creative Cloud completo', 'Canva Pro', 'Photoshop, Illustrator, After Effects', 'Templates premium', 'Armazenamento em nuvem']
),

(
  'Figma Professional + Framer Pro',
  'Para designers UI/UX profissionais. Figma Professional com recursos avançados + Framer Pro para protótipos interativos. Perfeito para equipes de design.',
  (SELECT id FROM categories WHERE name = 'Design & Criatividade'),
  3, 1, 79.90, 239.70,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '22 days',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=400',
  'active',
  ARRAY['Figma Professional', 'Framer Pro', 'Protótipos avançados', 'Colaboração em tempo real', 'Integrações dev']
),

-- Grupos de Educação
(
  'Coursera Plus + Udemy Business + MasterClass',
  'Educação premium! Acesso ilimitado ao Coursera Plus, Udemy Business e MasterClass. Mais de 10.000 cursos dos melhores professores do mundo.',
  (SELECT id FROM categories WHERE name = 'Educação'),
  4, 2, 124.90, 499.60,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '45 days',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
  'active',
  ARRAY['Coursera Plus - Cursos universitários', 'Udemy Business - 10k+ cursos', 'MasterClass - Especialistas mundiais', 'Certificados reconhecidos', 'Acesso vitalício aos cursos']
),

-- Grupos de Software
(
  'Microsoft 365 Family + Google Workspace',
  'Produtividade máxima! Microsoft 365 Family (Office completo) + Google Workspace. Word, Excel, PowerPoint, Gmail profissional, Drive ilimitado.',
  (SELECT id FROM categories WHERE name = 'Software'),
  6, 3, 49.90, 299.40,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '35 days',
  'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400',
  'active',
  ARRAY['Microsoft 365 Family', 'Google Workspace', 'Office completo', 'Email profissional', '1TB de armazenamento por pessoa']
),

-- Grupos quase cheios (para criar urgência)
(
  'Midjourney Pro + DALL-E + Stable Diffusion Pro',
  'O trio perfeito para geração de imagens com IA! Midjourney Pro, DALL-E credits e Stable Diffusion Pro. Crie artes incríveis com inteligência artificial.',
  (SELECT id FROM categories WHERE name = 'IA & Produtividade'),
  3, 1, 89.90, 269.70,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '5 days',
  'https://images.unsplash.com/photo-1686191128892-78b8b7c6fd64?w=400',
  'active',
  ARRAY['Midjourney Pro', 'DALL-E 3 Premium', 'Stable Diffusion Pro', 'Geração ilimitada', 'Uso comercial permitido']
),

-- Grupos com vagas disponíveis
(
  'Discord Nitro + Slack Pro + Zoom Pro',
  'Comunicação profissional completa! Discord Nitro para comunidades, Slack Pro para equipes e Zoom Pro para reuniões. Ideal para times remotos.',
  (SELECT id FROM categories WHERE name = 'Software'),
  5, 4, 39.90, 199.50,
  (SELECT id FROM profiles LIMIT 1),
  NOW() + INTERVAL '28 days',
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
  'active',
  ARRAY['Discord Nitro', 'Slack Pro', 'Zoom Pro', 'Reuniões ilimitadas', 'Integrações avançadas']
);

-- Inserir alguns participantes para tornar os grupos mais realistas
INSERT INTO group_members (group_id, user_id, joined_at) 
SELECT 
  g.id,
  p.id,
  NOW() - INTERVAL '1 day' * floor(random() * 10)
FROM groups g
CROSS JOIN (SELECT id FROM profiles LIMIT 3) p
WHERE g.available_spots < g.total_spots
AND random() < 0.7  -- 70% de chance de adicionar o membro
LIMIT 15;

-- Atualizar available_spots baseado nos membros adicionados
UPDATE groups 
SET available_spots = total_spots - (
  SELECT COUNT(*) 
  FROM group_members 
  WHERE group_members.group_id = groups.id
);