-- EXECUTE ESTE SQL NO PAINEL DO SUPABASE PARA CORRIGIR OS SAQUES
-- Copie e cole este código no SQL Editor do Supabase

-- 1. Remover política restritiva existente
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.withdrawals;

-- 2. Criar política que permite ao admin ver todos os saques
CREATE POLICY "Admin can view all withdrawals" ON public.withdrawals
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'calcadosdrielle@gmail.com'
    )
  );

-- 3. Permitir ao admin atualizar saques
DROP POLICY IF EXISTS "Admin can update withdrawals" ON public.withdrawals;
CREATE POLICY "Admin can update withdrawals" ON public.withdrawals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'calcadosdrielle@gmail.com'
    )
  );

-- 4. Criar função para processar saques
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