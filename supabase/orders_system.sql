-- ===========================================
-- SISTEMA DE PEDIDOS PARA PAGAMENTOS
-- ===========================================

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  
  -- Dados do pedido
  amount_cents INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'credits')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'expired')),
  
  -- Dados do pagamento externo
  external_payment_id TEXT, -- ID do MercadoPago
  external_payment_data JSONB, -- Dados completos do pagamento
  
  -- Metadados
  relationship TEXT, -- familia, amigos, etc
  quantity INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'), -- PIX expira em 24h
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Índices
  UNIQUE(external_payment_id) -- Evita duplicatas do MercadoPago
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_group_id ON public.orders(group_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_external_payment_id ON public.orders(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON public.orders(expires_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Função para criar pedido
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_group_id UUID,
  p_amount_cents INTEGER,
  p_payment_method TEXT,
  p_relationship TEXT DEFAULT NULL,
  p_quantity INTEGER DEFAULT 1,
  p_external_payment_id TEXT DEFAULT NULL,
  p_external_payment_data JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  order_record RECORD;
BEGIN
  -- Inserir pedido
  INSERT INTO public.orders (
    user_id,
    group_id,
    amount_cents,
    payment_method,
    relationship,
    quantity,
    external_payment_id,
    external_payment_data,
    status
  ) VALUES (
    p_user_id,
    p_group_id,
    p_amount_cents,
    p_payment_method,
    p_relationship,
    p_quantity,
    p_external_payment_id,
    p_external_payment_data,
    CASE 
      WHEN p_payment_method = 'credits' THEN 'paid' -- Créditos são imediatos
      ELSE 'pending' -- PIX e cartão ficam pendentes
    END
  ) RETURNING * INTO order_record;
  
  -- Se for pagamento com créditos, processar imediatamente
  IF p_payment_method = 'credits' THEN
    -- Verificar se tem saldo suficiente
    DECLARE
      user_balance INTEGER;
    BEGIN
      SELECT balance_cents INTO user_balance 
      FROM public.profiles 
      WHERE user_id = p_user_id;
      
      IF user_balance < p_amount_cents THEN
        -- Cancelar pedido
        UPDATE public.orders 
        SET status = 'failed' 
        WHERE id = order_record.id;
        
        RETURN json_build_object(
          'success', false,
          'error', 'Saldo insuficiente',
          'order_id', order_record.id
        );
      END IF;
      
      -- Debitar saldo
      UPDATE public.profiles 
      SET balance_cents = balance_cents - p_amount_cents
      WHERE user_id = p_user_id;
      
      -- Adicionar ao grupo
      INSERT INTO public.group_memberships (
        user_id,
        group_id,
        status,
        relationship
      ) VALUES (
        p_user_id,
        p_group_id,
        'active',
        p_relationship
      ) ON CONFLICT (user_id, group_id) DO UPDATE SET
        status = 'active',
        relationship = EXCLUDED.relationship;
      
      -- Marcar como pago
      UPDATE public.orders 
      SET 
        status = 'paid',
        paid_at = NOW()
      WHERE id = order_record.id;
    END;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'order_id', order_record.id,
    'status', order_record.status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar pagamento de pedido
CREATE OR REPLACE FUNCTION process_order_payment(
  p_order_id UUID,
  p_external_payment_id TEXT DEFAULT NULL,
  p_external_payment_data JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  order_record RECORD;
BEGIN
  -- Buscar pedido
  SELECT * INTO order_record 
  FROM public.orders 
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pedido não encontrado'
    );
  END IF;
  
  IF order_record.status != 'pending' AND order_record.status != 'processing' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Pedido já foi processado'
    );
  END IF;
  
  -- Atualizar pedido
  UPDATE public.orders 
  SET 
    status = 'paid',
    paid_at = NOW(),
    external_payment_id = COALESCE(p_external_payment_id, external_payment_id),
    external_payment_data = COALESCE(p_external_payment_data, external_payment_data)
  WHERE id = p_order_id;
  
  -- Adicionar ao grupo
  INSERT INTO public.group_memberships (
    user_id,
    group_id,
    status,
    relationship
  ) VALUES (
    order_record.user_id,
    order_record.group_id,
    'active',
    order_record.relationship
  ) ON CONFLICT (user_id, group_id) DO UPDATE SET
    status = 'active',
    relationship = EXCLUDED.relationship;
  
  RETURN json_build_object(
    'success', true,
    'order_id', p_order_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cancelar pedidos expirados
CREATE OR REPLACE FUNCTION cancel_expired_orders()
RETURNS INTEGER AS $$
DECLARE
  cancelled_count INTEGER;
BEGIN
  UPDATE public.orders 
  SET status = 'expired'
  WHERE status IN ('pending', 'processing')
    AND expires_at < NOW();
  
  GET DIAGNOSTICS cancelled_count = ROW_COUNT;
  RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios pedidos
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios pedidos
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios pedidos (apenas alguns campos)
CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins podem ver todos os pedidos
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT EXECUTE ON FUNCTION create_order TO authenticated;
GRANT EXECUTE ON FUNCTION process_order_payment TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_expired_orders TO authenticated;

-- Comentários
COMMENT ON TABLE public.orders IS 'Tabela de pedidos para controle de pagamentos';
COMMENT ON FUNCTION create_order IS 'Cria um novo pedido de participação em grupo';
COMMENT ON FUNCTION process_order_payment IS 'Processa o pagamento de um pedido';
COMMENT ON FUNCTION cancel_expired_orders IS 'Cancela pedidos expirados (executar via cron)';
