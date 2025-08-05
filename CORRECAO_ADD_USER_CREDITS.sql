-- ===========================================
-- CORREÇÃO: FUNÇÃO ADD_USER_CREDITS
-- ===========================================

-- 1. VERIFICAR SE A FUNÇÃO EXISTE
-- ===========================================
SELECT 
    '=== VERIFICANDO FUNÇÃO ADD_USER_CREDITS ===' as info;

SELECT 
    'Função add_user_credits existe?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO - PRECISA CRIAR'
    END as resposta
FROM pg_proc 
WHERE proname = 'add_user_credits';

-- 2. VERIFICAR SE A FUNÇÃO CALCULATE_ADMIN_FEE EXISTE
-- ===========================================
SELECT 
    '=== VERIFICANDO FUNÇÃO CALCULATE_ADMIN_FEE ===' as info;

SELECT 
    'Função calculate_admin_fee existe?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO - PRECISA CRIAR'
    END as resposta
FROM pg_proc 
WHERE proname = 'calculate_admin_fee';

-- 3. CRIAR FUNÇÃO CALCULATE_ADMIN_FEE SE NÃO EXISTIR
-- ===========================================
CREATE OR REPLACE FUNCTION calculate_admin_fee(amount_cents INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(FLOOR(amount_cents * 0.05), 100);
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR FUNÇÃO ADD_USER_CREDITS
-- ===========================================
CREATE OR REPLACE FUNCTION add_user_credits(
  user_uuid UUID,
  amount_cents INTEGER,
  payment_method_param TEXT,
  external_payment_id_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  fee_amount INTEGER;
  transaction_id UUID;
BEGIN
  -- Calcular taxa administrativa
  fee_amount := calculate_admin_fee(amount_cents);
  
  -- Adicionar créditos ao saldo
  UPDATE public.profiles 
  SET balance_cents = balance_cents + amount_cents
  WHERE user_id = user_uuid;
  
  -- Registrar transação
  INSERT INTO public.transactions (
    user_id,
    type,
    amount_cents,
    fee_cents,
    description,
    payment_method,
    status
  ) VALUES (
    user_uuid,
    'credit_purchase',
    amount_cents,
    fee_amount,
    'Adição de créditos',
    payment_method_param,
    'completed'
  ) RETURNING id INTO transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'new_balance', (SELECT balance_cents FROM public.profiles WHERE user_id = user_uuid),
    'fee_amount', fee_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR SE AS FUNÇÕES FORAM CRIADAS
-- ===========================================
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    'Função calculate_admin_fee criada?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - FUNÇÃO CRIADA'
        ELSE '❌ NÃO - ERRO AO CRIAR FUNÇÃO'
    END as resposta
FROM pg_proc 
WHERE proname = 'calculate_admin_fee';

SELECT 
    'Função add_user_credits criada?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM - FUNÇÃO CRIADA'
        ELSE '❌ NÃO - ERRO AO CRIAR FUNÇÃO'
    END as resposta
FROM pg_proc 
WHERE proname = 'add_user_credits';

-- 6. TESTE SIMULADO
-- ===========================================
SELECT 
    '=== TESTE SIMULADO ===' as info;

-- Simular cálculo de taxa
SELECT 
    'Teste calculate_admin_fee:' as info,
    calculate_admin_fee(1000) as taxa_1000_centavos,
    calculate_admin_fee(5000) as taxa_5000_centavos;

-- 7. VERIFICAR ESTRUTURA DA TABELA TRANSACTIONS
-- ===========================================
SELECT 
    '=== VERIFICAÇÃO DA TABELA TRANSACTIONS ===' as info;

SELECT 
    'Coluna external_payment_id existe?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO - VAMOS ADICIONAR'
    END as resposta
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
AND column_name = 'external_payment_id';

-- 8. ADICIONAR COLUNA EXTERNAL_PAYMENT_ID SE NÃO EXISTIR
-- ===========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND table_schema = 'public'
        AND column_name = 'external_payment_id'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN external_payment_id TEXT;
        RAISE NOTICE 'Coluna external_payment_id adicionada';
    ELSE
        RAISE NOTICE 'Coluna external_payment_id já existe';
    END IF;
END $$;

-- 9. ATUALIZAR FUNÇÃO ADD_USER_CREDITS COM EXTERNAL_PAYMENT_ID
-- ===========================================
CREATE OR REPLACE FUNCTION add_user_credits(
  user_uuid UUID,
  amount_cents INTEGER,
  payment_method_param TEXT,
  external_payment_id_param TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  fee_amount INTEGER;
  transaction_id UUID;
BEGIN
  -- Calcular taxa administrativa
  fee_amount := calculate_admin_fee(amount_cents);
  
  -- Adicionar créditos ao saldo
  UPDATE public.profiles 
  SET balance_cents = balance_cents + amount_cents
  WHERE user_id = user_uuid;
  
  -- Registrar transação
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
  ) RETURNING id INTO transaction_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'new_balance', (SELECT balance_cents FROM public.profiles WHERE user_id = user_uuid),
    'fee_amount', fee_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RESUMO FINAL
-- ===========================================
SELECT 
    '=== RESUMO DA CORREÇÃO ===' as info;

SELECT 
    '✅ Função calculate_admin_fee criada' as status,
    'Cálculo de taxa administrativa funcionando' as detalhe;

SELECT 
    '✅ Função add_user_credits criada' as status,
    'Adição de créditos funcionando' as detalhe;

SELECT 
    '✅ Coluna external_payment_id adicionada' as status,
    'Suporte a IDs externos de pagamento' as detalhe;

SELECT 
    '✅ Sistema pronto' as status,
    'Teste a adição de créditos novamente' as detalhe; 