-- ===========================================
-- PASSO 1: FUNÇÕES ESSENCIAIS
-- Execute este arquivo primeiro
-- ===========================================

-- Função para calcular taxa administrativa
CREATE OR REPLACE FUNCTION calculate_admin_fee(amount_cents INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(FLOOR(amount_cents * 0.05), 100);
END;
$$ LANGUAGE plpgsql;

-- Função para adicionar créditos
CREATE OR REPLACE FUNCTION add_user_credits(
  user_uuid UUID,
  amount_cents INTEGER,
  payment_method_param TEXT,
  external_payment_id_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  fee_amount INTEGER;
BEGIN
  fee_amount := calculate_admin_fee(amount_cents);
  
  UPDATE public.profiles 
  SET balance_cents = balance_cents + amount_cents
  WHERE user_id = user_uuid;
  
  INSERT INTO public.transactions (
    user_id,
    type,
    amount_cents,
    fee_cents,
    description,
    payment_method,
    external_payment_id,
    status
  ) VALUES (
    user_uuid,
    'credit_purchase',
    amount_cents,
    fee_amount,
    'Adição de créditos',
    payment_method_param,
    external_payment_id_param,
    'completed'
  );
  
  RETURN json_build_object(
    'success', true,
    'new_balance', (SELECT balance_cents FROM public.profiles WHERE user_id = user_uuid)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para solicitar saque
CREATE OR REPLACE FUNCTION request_withdrawal(
  user_uuid UUID,
  amount_cents INTEGER,
  pix_key_param TEXT
)
RETURNS JSON AS $$
DECLARE
  user_balance INTEGER;
  min_withdrawal INTEGER := 1000;
BEGIN
  SELECT balance_cents INTO user_balance 
  FROM public.profiles 
  WHERE user_id = user_uuid;
  
  IF amount_cents < min_withdrawal THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Valor mínimo para saque é R$ 10,00'
    );
  END IF;
  
  IF user_balance < amount_cents THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Saldo insuficiente'
    );
  END IF;
  
  UPDATE public.profiles 
  SET balance_cents = balance_cents - amount_cents
  WHERE user_id = user_uuid;
  
  INSERT INTO public.withdrawals (
    user_id,
    amount_cents,
    pix_key,
    status
  ) VALUES (
    user_uuid,
    amount_cents,
    pix_key_param,
    'pending'
  );
  
  INSERT INTO public.transactions (
    user_id,
    type,
    amount_cents,
    description,
    payment_method,
    status
  ) VALUES (
    user_uuid,
    'withdrawal',
    -amount_cents,
    'Solicitação de saque',
    'pix',
    'pending'
  );
  
  RETURN json_build_object(
    'success', true,
    'withdrawal_id', (SELECT id FROM public.withdrawals WHERE user_id = user_uuid ORDER BY created_at DESC LIMIT 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar saque (marcar como concluído)
CREATE OR REPLACE FUNCTION process_withdrawal(
  withdrawal_uuid UUID
)
RETURNS JSON AS $$
DECLARE
  withdrawal_record RECORD;
BEGIN
  -- Buscar o saque
  SELECT * INTO withdrawal_record 
  FROM public.withdrawals 
  WHERE id = withdrawal_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Saque não encontrado'
    );
  END IF;
  
  IF withdrawal_record.status != 'pending' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Saque já foi processado'
    );
  END IF;
  
  -- Marcar saque como concluído
  UPDATE public.withdrawals 
  SET 
    status = 'completed',
    processed_at = now()
  WHERE id = withdrawal_uuid;
  
  -- Atualizar a transação relacionada
  UPDATE public.transactions 
  SET status = 'completed'
  WHERE user_id = withdrawal_record.user_id 
    AND type = 'withdrawal' 
    AND amount_cents = -withdrawal_record.amount_cents
    AND created_at >= withdrawal_record.created_at - interval '1 minute'
    AND created_at <= withdrawal_record.created_at + interval '1 minute';
  
  RETURN json_build_object(
    'success', true,
    'message', 'Saque processado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;