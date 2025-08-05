-- =====================================================
-- CRIAR GRUPO DE TESTE PARA VER A INTERFACE DE LIBERAÇÃO
-- Execute este SQL no Supabase para criar um grupo que precisa ser liberado
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
    SELECT user_id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'calcadosdrielle@gmail.com'  -- SUBSTITUA PELO SEU EMAIL
    LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Usuário não encontrado. Verifique o email.';
    END IF;
    
    -- Buscar um serviço para o teste
    SELECT id INTO service_uuid 
    FROM public.services 
    WHERE name LIKE '%Adobe%' 
    LIMIT 1;
    
    IF service_uuid IS NULL THEN
        RAISE EXCEPTION 'Serviço não encontrado.';
    END IF;
    
    -- Criar grupo de teste que precisa ser liberado
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
        admin_approved,
        owner_approved,  -- FALSE para mostrar a interface de liberação
        status,
        current_members,
        created_at,
        updated_at
    ) VALUES (
        user_uuid,
        service_uuid,
        'Adobe Creative Cloud - TESTE LIBERAÇÃO',
        'Grupo de teste para demonstrar a interface de liberação pelo dono',
        'Este é um grupo de teste para ver a funcionalidade de liberação',
        'family',
        6,
        1000, -- R$ 10,00
        false,
        true,  -- admin_approved = true (já aprovado pelo admin)
        false, -- owner_approved = false (PRECISA SER LIBERADO)
        'waiting_subscription', -- status aguardando liberação
        0,
        now(),
        now()
    ) RETURNING id INTO new_group_id;
    
    RAISE NOTICE 'Grupo de teste criado com ID: %', new_group_id;
    RAISE NOTICE 'Acesse: /grupo/%/gerenciar para ver a interface de liberação', new_group_id;
    
END $$;

-- Verificar se o grupo foi criado corretamente
SELECT 
    id,
    name,
    admin_approved,
    owner_approved,
    status,
    'Acesse /grupo/' || id || '/gerenciar para ver a interface' as instrucao
FROM public.groups 
WHERE name LIKE '%TESTE LIBERAÇÃO%'
ORDER BY created_at DESC
LIMIT 1;
