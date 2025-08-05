-- =====================================================
-- CRIAR GRUPO PARA TESTAR APROVAÇÃO DO ADMINISTRADOR
-- Execute este SQL no Supabase para criar um grupo que precisa ser aprovado
-- =====================================================

-- Primeiro, vamos encontrar seu user_id
-- Substitua 'SEU_EMAIL_AQUI' pelo seu email de login
DO $$
DECLARE
    user_uuid UUID;
    service_uuid UUID;
    new_group_id UUID;
BEGIN
    -- Buscar seu user_id pelo email (substitua pelo seu email)
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'calcadosdrielle@gmail.com'  -- SUBSTITUA PELO SEU EMAIL
    LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado. Verifique o email.';
    END IF;
    
    -- Buscar um serviço para o teste
    SELECT id INTO service_uuid 
    FROM public.services 
    WHERE name LIKE '%Netflix%' 
    LIMIT 1;
    
    IF service_uuid IS NULL THEN
        RAISE EXCEPTION 'Serviço não encontrado.';
    END IF;
    
    -- Criar grupo de teste que precisa ser aprovado pelo admin
    INSERT INTO public.groups (
        admin_id,
        service_id,
        name,
        description,
        rules,
        relationship_type,
        max_members,
        price_per_slot_cents,
        instant_access,
        admin_approved,  -- FALSE para testar aprovação do admin
        owner_approved,  -- FALSE também
        status,
        current_members,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        service_uuid,
        'Netflix Premium - TESTE APROVAÇÃO ADMIN',
        'Grupo de teste para demonstrar o fluxo de aprovação pelo administrador',
        'Este é um grupo de teste para ver a funcionalidade de aprovação do admin',
        'family',
        4,
        1500, -- R$ 15,00
        false,
        false, -- admin_approved = false (PRECISA SER APROVADO)
        false, -- owner_approved = false (depois precisa ser liberado)
        'waiting_subscription', -- status aguardando aprovação
        0,
        now(),
        now()
    ) RETURNING id INTO new_group_id;
    
    RAISE NOTICE 'Grupo de teste criado com ID: %', new_group_id;
    RAISE NOTICE 'Acesse /admin para aprovar o grupo como administrador';
    RAISE NOTICE 'Depois acesse /grupo/%/gerenciar para liberar como dono', new_group_id;
    
END $$;

-- Verificar se o grupo foi criado corretamente
SELECT 
    id,
    name,
    admin_approved,
    owner_approved,
    status,
    'Acesse /admin para aprovar este grupo' as instrucao_admin,
    'Depois acesse /grupo/' || id || '/gerenciar para liberar' as instrucao_dono
FROM public.groups 
WHERE name LIKE '%TESTE APROVAÇÃO ADMIN%'
ORDER BY created_at DESC
LIMIT 1;
