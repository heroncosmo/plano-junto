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