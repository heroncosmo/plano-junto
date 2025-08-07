# 🚀 **EXECUTAR SQL DE MEDIAÇÃO NO SUPABASE**

## 📍 **Localização do Arquivo SQL**
O arquivo está em: `supabase/admin_mediation_system.sql`

## 🔧 **Como Executar:**

### **1. Acesse o Supabase Dashboard**
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto JuntaPlay

### **2. Abra o SQL Editor**
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New Query"**

### **3. Execute o SQL**
- Copie todo o conteúdo do arquivo `supabase/admin_mediation_system.sql`
- Cole no editor SQL do Supabase
- Clique em **"Run"** para executar

## 📋 **Conteúdo do SQL que será executado:**

```sql
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
```

## ✅ **Após Executar:**

1. **Teste o Sistema**: Acesse `http://localhost:8081/admin/complaints`
2. **Verifique as Funções**: As funções `process_admin_refund` e `close_complaint_without_refund` estarão disponíveis
3. **Teste a Mediação**: Tente usar os botões "Aprovar Estorno" e "Fechar Sem Estorno"

## 🎯 **Resultado Esperado:**
- ✅ Funções SQL criadas no Supabase
- ✅ Sistema de mediação funcionando
- ✅ Botões de ação ativos para reclamações vencidas
- ✅ Notificações enviadas aos usuários

## 📞 **Se Houver Problemas:**
- Verifique se o SQL foi executado com sucesso
- Confirme que não há erros no console do navegador
- Teste acessando diretamente: `http://localhost:8081/admin/complaints` 