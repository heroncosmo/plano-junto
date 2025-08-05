-- Adicionar campo owner_approved na tabela groups
-- Execute este SQL no Supabase para adicionar a funcionalidade de liberação pelo dono do grupo

ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS owner_approved BOOLEAN DEFAULT false;

-- Comentário para o campo
COMMENT ON COLUMN public.groups.owner_approved IS 'Indica se o dono do grupo aprovou/liberou o grupo após aprovação do admin';

-- Atualizar grupos existentes que já estão aprovados pelo admin para também serem aprovados pelo owner
-- (para não quebrar grupos existentes)
UPDATE public.groups 
SET owner_approved = true 
WHERE admin_approved = true AND status = 'active_with_slots';
