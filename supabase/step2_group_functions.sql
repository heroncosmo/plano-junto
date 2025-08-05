-- ===========================================
-- PASSO 2: FUNÇÕES DE GRUPO
-- Execute após o PASSO 1
-- ===========================================

-- Função para verificar se grupo pode ser ativado
CREATE OR REPLACE FUNCTION check_group_activation(group_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  group_data RECORD;
  member_count INTEGER;
BEGIN
  SELECT * INTO group_data 
  FROM public.groups 
  WHERE id = group_uuid;
  
  SELECT COUNT(*) INTO member_count 
  FROM public.group_memberships 
  WHERE group_id = group_uuid;
  
  RETURN member_count >= group_data.max_members;
END;
$$ LANGUAGE plpgsql;

-- Função para processar pagamento de grupo (versão simplificada)
CREATE OR REPLACE FUNCTION process_group_payment(
  user_uuid UUID,
  group_uuid UUID,
  payment_amount_cents INTEGER,
  payment_method_param TEXT
)
RETURNS JSON AS $$
DECLARE
  user_balance INTEGER;
  group_data RECORD;
  admin_fee INTEGER;
BEGIN
  SELECT balance_cents INTO user_balance 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  SELECT * INTO group_data 
  FROM public.groups 
  WHERE id = group_uuid;
  
  admin_fee := calculate_admin_fee(payment_amount_cents);
  
  IF payment_method_param = 'credits' THEN
    IF user_balance < payment_amount_cents THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Saldo insuficiente'
      );
    END IF;
    
    UPDATE public.profiles 
    SET balance_cents = balance_cents - payment_amount_cents
    WHERE user_id = user_uuid;
  END IF;
  
  INSERT INTO public.transactions (
    user_id, 
    type, 
    amount_cents, 
    fee_cents,
    description, 
    group_id, 
    payment_method, 
    status
  ) VALUES (
    user_uuid,
    'group_payment',
    payment_amount_cents,
    admin_fee,
    'Pagamento para grupo: ' || group_data.name,
    group_uuid,
    payment_method_param,
    'completed'
  );
  
  INSERT INTO public.group_memberships (
    group_id,
    user_id,
    paid_amount_cents
  ) VALUES (
    group_uuid,
    user_uuid,
    payment_amount_cents
  );
  
  UPDATE public.groups 
  SET current_members = current_members + 1
  WHERE id = group_uuid;
  
  IF check_group_activation(group_uuid) THEN
    UPDATE public.groups 
    SET status = 'active_with_slots'
    WHERE id = group_uuid;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'group_activated', check_group_activation(group_uuid)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para liberar grupo pelo dono
CREATE OR REPLACE FUNCTION approve_group_by_owner(
  group_uuid UUID,
  user_uuid UUID
)
RETURNS JSON AS $$
DECLARE
  group_data RECORD;
BEGIN
  -- Verificar se o grupo existe e se o usuário é o admin
  SELECT * INTO group_data
  FROM public.groups
  WHERE id = group_uuid AND admin_id = user_uuid;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Grupo não encontrado ou você não tem permissão'
    );
  END IF;

  -- Verificar se o grupo foi aprovado pelo admin
  IF NOT group_data.admin_approved THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Grupo ainda não foi aprovado pelo administrador'
    );
  END IF;

  -- Verificar se já foi liberado pelo dono
  IF group_data.owner_approved THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Grupo já foi liberado'
    );
  END IF;

  -- Liberar o grupo
  UPDATE public.groups
  SET
    owner_approved = true,
    status = 'active_with_slots',
    updated_at = now()
  WHERE id = group_uuid;

  RETURN json_build_object(
    'success', true,
    'message', 'Grupo liberado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;