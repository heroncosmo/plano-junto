-- ========================================
-- CORREÇÃO: ESTORNO E REMOÇÃO DO MEMBRO
-- ========================================
-- Este script corrige a função process_admin_refund para
-- também remover o membro do grupo quando há estorno

-- 1. Verificar se a função existe
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'process_admin_refund'
AND routine_schema = 'public';

-- 2. Recriar a função com remoção do membro
CREATE OR REPLACE FUNCTION process_admin_refund(
  complaint_id UUID,
  admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  complaint_record RECORD;
  group_record RECORD;
  user_record RECORD;
  refund_amount INTEGER;
  result JSON;
BEGIN
  -- Buscar dados da reclamação
  SELECT 
    c.*,
    g.price as group_price,
    g.name as group_name,
    p.full_name as user_name
  INTO complaint_record
  FROM complaints c
  LEFT JOIN groups g ON c.group_id = g.id
  LEFT JOIN profiles p ON c.user_id = p.user_id
  WHERE c.id = complaint_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reclamação não encontrada'
    );
  END IF;
  
  -- Verificar se a reclamação já foi resolvida
  IF complaint_record.status IN ('resolved', 'closed') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reclamação já foi resolvida'
    );
  END IF;
  
  -- Calcular valor do estorno (preço do grupo)
  refund_amount := complaint_record.group_price;
  
  -- Iniciar transação
  BEGIN
    -- 1. Adicionar créditos ao usuário
    UPDATE profiles 
    SET credits = credits + refund_amount
    WHERE user_id = complaint_record.user_id;
    
    -- 2. Criar transação de estorno
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      description,
      status,
      related_group_id
    ) VALUES (
      complaint_record.user_id,
      'refund',
      refund_amount,
      'Estorno por reclamação - ' || complaint_record.group_name,
      'completed',
      complaint_record.group_id
    );
    
    -- 3. Remover usuário do grupo
    UPDATE group_memberships 
    SET 
      status = 'left',
      left_at = NOW()
    WHERE 
      user_id = complaint_record.user_id 
      AND group_id = complaint_record.group_id
      AND status = 'active';
    
    -- 4. Marcar reclamação como resolvida
    UPDATE complaints 
    SET 
      status = 'resolved',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE id = complaint_id;
    
    -- 5. Adicionar mensagem de sistema
    INSERT INTO complaint_messages (
      complaint_id,
      user_id,
      message_type,
      message
    ) VALUES (
      complaint_id,
      admin_user_id,
      'system_message',
      'Reclamação resolvida com estorno. Usuário removido do grupo.'
    );
    
    -- Retornar sucesso
    result := json_build_object(
      'success', true,
      'refund_amount', refund_amount,
      'user_name', complaint_record.user_name,
      'group_name', complaint_record.group_name,
      'message', 'Estorno processado e usuário removido do grupo'
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback automático em caso de erro
    result := json_build_object(
      'success', false,
      'error', 'Erro ao processar estorno: ' || SQLERRM
    );
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Verificar se a função foi criada
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'process_admin_refund'
AND routine_schema = 'public';

-- 4. Testar a função (comentado para segurança)
-- SELECT process_admin_refund('complaint-id-aqui', 'admin-id-aqui');

SELECT 'Função process_admin_refund corrigida com remoção do membro!' as status; 