-- ========================================
-- SISTEMA DE MEDIAÇÃO DO ADMINISTRADOR
-- ========================================

-- 1. FUNÇÃO PARA PROCESSAR ESTORNO AUTOMÁTICO
-- =============================================

CREATE OR REPLACE FUNCTION process_admin_refund(
  complaint_id UUID,
  admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  complaint_record RECORD;
  membership_record RECORD;
  refund_amount_cents INTEGER;
  result JSON;
BEGIN
  -- Buscar dados da reclamação
  SELECT 
    c.*,
    gm.paid_amount_cents,
    gm.id as membership_id
  INTO complaint_record
  FROM complaints c
  LEFT JOIN group_memberships gm ON gm.user_id = c.user_id AND gm.group_id = c.group_id
  WHERE c.id = complaint_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Reclamação não encontrada');
  END IF;
  
  -- Verificar se já foi processada
  IF complaint_record.status IN ('resolved', 'closed') THEN
    RETURN json_build_object('success', false, 'error', 'Reclamação já foi processada');
  END IF;
  
  -- Calcular valor do estorno (valor pago pelo membro)
  refund_amount_cents := COALESCE(complaint_record.paid_amount_cents, 0);
  
  -- Iniciar transação
  BEGIN
    -- 1. Atualizar status da reclamação
    UPDATE complaints 
    SET 
      status = 'resolved',
      resolved_at = NOW(),
      updated_at = NOW()
    WHERE id = complaint_id;
    
    -- 2. Criar registro de cancelamento
    INSERT INTO cancellations (
      user_id,
      group_id,
      membership_id,
      reason,
      refund_amount_cents,
      processing_fee_cents,
      final_refund_cents,
      status,
      created_at,
      updated_at
    ) VALUES (
      complaint_record.user_id,
      complaint_record.group_id,
      complaint_record.membership_id,
      'Reclamação resolvida pelo administrador do sistema',
      refund_amount_cents,
      0, -- Sem taxa de processamento
      refund_amount_cents,
      'completed',
      NOW(),
      NOW()
    );
    
    -- 3. Criar registro de reembolso
    INSERT INTO refunds (
      user_id,
      group_id,
      amount_cents,
      reason,
      status,
      created_at,
      updated_at
    ) VALUES (
      complaint_record.user_id,
      complaint_record.group_id,
      refund_amount_cents,
      'Reembolso aprovado pelo administrador do sistema',
      'completed',
      NOW(),
      NOW()
    );
    
    -- 4. Atualizar saldo do usuário
    UPDATE profiles 
    SET 
      balance_cents = balance_cents + refund_amount_cents,
      updated_at = NOW()
    WHERE user_id = complaint_record.user_id;
    
    -- 5. Registrar transação de reembolso
    INSERT INTO transactions (
      user_id,
      type,
      amount_cents,
      description,
      group_id,
      payment_method,
      status,
      created_at,
      updated_at
    ) VALUES (
      complaint_record.user_id,
      'balance_adjustment',
      refund_amount_cents,
      'Reembolso aprovado pelo administrador - Reclamação #' || complaint_id,
      complaint_record.group_id,
      'admin_refund',
      'completed',
      NOW(),
      NOW()
    );
    
    -- 6. Atualizar status da membership (se existir)
    IF complaint_record.membership_id IS NOT NULL THEN
      UPDATE group_memberships 
      SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        cancellation_reason = 'Reclamação resolvida pelo administrador'
      WHERE id = complaint_record.membership_id;
    END IF;
    
    -- 7. Criar notificação para o usuário
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      category,
      is_important,
      created_at
    ) VALUES (
      complaint_record.user_id,
      'Reembolso Aprovado',
      'Sua reclamação foi resolvida e o reembolso foi aprovado pelo administrador do sistema.',
      'success',
      'complaint',
      true,
      NOW()
    );
    
    result := json_build_object(
      'success', true,
      'refund_amount_cents', refund_amount_cents,
      'message', 'Reembolso processado com sucesso'
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback em caso de erro
    RAISE EXCEPTION 'Erro ao processar reembolso: %', SQLERRM;
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNÇÃO PARA FECHAR RECLAMAÇÃO SEM ESTORNO
-- ==============================================

CREATE OR REPLACE FUNCTION close_complaint_without_refund(
  complaint_id UUID,
  admin_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  complaint_record RECORD;
  result JSON;
BEGIN
  -- Buscar dados da reclamação
  SELECT * INTO complaint_record
  FROM complaints 
  WHERE id = complaint_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Reclamação não encontrada');
  END IF;
  
  -- Verificar se já foi processada
  IF complaint_record.status IN ('resolved', 'closed') THEN
    RETURN json_build_object('success', false, 'error', 'Reclamação já foi processada');
  END IF;
  
  -- Fechar reclamação
  UPDATE complaints 
  SET 
    status = 'closed',
    closed_at = NOW(),
    updated_at = NOW()
  WHERE id = complaint_id;
  
  -- Criar notificação para o usuário
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    category,
    is_important,
    created_at
  ) VALUES (
    complaint_record.user_id,
    'Reclamação Fechada',
    'Sua reclamação foi analisada e fechada pelo administrador do sistema.',
    'info',
    'complaint',
    true,
    NOW()
  );
  
  result := json_build_object(
    'success', true,
    'message', 'Reclamação fechada com sucesso'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. VERIFICAR RECLAMAÇÕES VENCIDAS
-- ==================================

-- Query para verificar reclamações que passaram do prazo
SELECT 
  c.id,
  c.user_id,
  c.group_id,
  c.admin_id,
  c.status,
  c.created_at,
  c.admin_response_deadline,
  c.intervention_deadline,
  NOW() > c.admin_response_deadline as is_overdue,
  p.full_name as user_name,
  g.name as group_name,
  ap.full_name as admin_name
FROM complaints c
JOIN profiles p ON c.user_id = p.user_id
JOIN groups g ON c.group_id = g.id
JOIN profiles ap ON c.admin_id = ap.user_id
WHERE c.status IN ('pending', 'admin_responded', 'user_responded')
  AND NOW() > c.admin_response_deadline
ORDER BY c.created_at DESC;

-- 4. ESTATÍSTICAS DE RECLAMAÇÕES
-- ================================

-- Total de reclamações por status
SELECT 
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN NOW() > admin_response_deadline THEN 1 END) as overdue
FROM complaints
GROUP BY status
ORDER BY total DESC;

-- Reclamações que precisam de mediação
SELECT 
  COUNT(*) as total_need_mediation
FROM complaints
WHERE status IN ('pending', 'admin_responded', 'user_responded')
  AND NOW() > admin_response_deadline;

SELECT 'Sistema de mediação do administrador configurado!' as status; 