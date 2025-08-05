-- SOLUÇÃO IMEDIATA - Execute no SQL Editor do Supabase
-- Esta solução vai desabilitar RLS temporariamente para a tabela withdrawals

-- 1. Desabilitar RLS na tabela withdrawals (TEMPORÁRIO)
ALTER TABLE public.withdrawals DISABLE ROW LEVEL SECURITY;

-- 2. Criar a função para processar saques
CREATE OR REPLACE FUNCTION process_withdrawal(withdrawal_uuid UUID)
RETURNS JSON AS $$
DECLARE
  withdrawal_record RECORD;
BEGIN
  SELECT * INTO withdrawal_record FROM public.withdrawals WHERE id = withdrawal_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Saque não encontrado');
  END IF;
  
  IF withdrawal_record.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Saque já foi processado');
  END IF;
  
  UPDATE public.withdrawals 
  SET status = 'completed', processed_at = now()
  WHERE id = withdrawal_uuid;
  
  UPDATE public.transactions 
  SET status = 'completed'
  WHERE user_id = withdrawal_record.user_id 
    AND type = 'withdrawal' 
    AND amount_cents = -withdrawal_record.amount_cents
    AND created_at >= withdrawal_record.created_at - interval '1 minute'
    AND created_at <= withdrawal_record.created_at + interval '1 minute';
  
  RETURN json_build_object('success', true, 'message', 'Saque processado com sucesso');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DEPOIS QUE FUNCIONAR, execute este SQL para reabilitar RLS com política correta:
/*
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users and admin can access withdrawals" ON public.withdrawals
  FOR ALL USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'calcadosdrielle@gmail.com'
    )
  );
*/