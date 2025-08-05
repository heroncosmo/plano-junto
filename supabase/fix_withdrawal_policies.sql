-- Script para corrigir problemas com saques no sistema

-- 1. Primeiro, verificar se a função process_withdrawal existe
-- Execute esta query para verificar se a função foi criada:
-- SELECT proname FROM pg_proc WHERE proname = 'process_withdrawal';

-- 2. Criar a função process_withdrawal se não existir
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

-- 3. Verificar e corrigir políticas RLS para permitir ao admin ver todos os saques
-- Remover política restritiva se existir
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.withdrawals;

-- Criar nova política que permite ao admin ver todos os saques
CREATE POLICY "Users can view their own withdrawals or admin can view all" ON public.withdrawals
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'calcadosdrielle@gmail.com'
    )
  );

-- 4. Permitir ao admin atualizar saques (para marcar como concluído)
CREATE POLICY "Admin can update withdrawals" ON public.withdrawals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email = 'calcadosdrielle@gmail.com'
    )
  );

-- 5. Verificar se existem saques na tabela (query de teste)
-- SELECT COUNT(*) FROM public.withdrawals;
-- SELECT * FROM public.withdrawals ORDER BY created_at DESC LIMIT 5;

-- 6. Inserir um saque de teste (remover depois de testar)
-- INSERT INTO public.withdrawals (user_id, amount_cents, pix_key, status)
-- VALUES ('00000000-0000-0000-0000-000000000000', 1000, 'teste@email.com', 'pending');