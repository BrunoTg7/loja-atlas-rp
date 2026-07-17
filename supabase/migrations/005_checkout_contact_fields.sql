-- ═══════════════════════════════════════════════════════════════
-- Migration 005: Adicionar campos de contato ao checkout
-- Adiciona discord_id, contact_name, contact_email, contact_phone
-- na tabela orders e atualiza a RPC create_order_with_payment
-- ═══════════════════════════════════════════════════════════════

-- 1. Adicionar colunas na tabela orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS discord_id TEXT,
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- 2. Recriar a função create_order_with_payment com os novos parâmetros
CREATE OR REPLACE FUNCTION create_order_with_payment(
  p_order_id TEXT,
  p_user_steam_id TEXT,
  p_steam_hex TEXT,
  p_char_id TEXT,
  p_total_cents INTEGER,
  p_currency TEXT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_terms_accepted BOOLEAN,
  p_terms_version TEXT,
  p_customer_ip TEXT,
  p_items JSONB,
  p_payment_id TEXT,
  p_gateway TEXT,
  p_discord_id TEXT DEFAULT NULL,
  p_contact_name TEXT DEFAULT NULL,
  p_contact_email TEXT DEFAULT NULL,
  p_contact_phone TEXT DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
  IF p_terms_accepted IS NOT TRUE THEN
    RAISE EXCEPTION 'Os termos de reembolso de moedas virtuais devem ser aceitos obrigatoriamente.';
  END IF;

  INSERT INTO orders (
    id, user_steam_id, steam_hex, char_id, status, total_cents, currency,
    customer_name, customer_email, terms_accepted, terms_version, customer_ip,
    discord_id, contact_name, contact_email, contact_phone
  )
  VALUES (
    p_order_id, p_user_steam_id, p_steam_hex, p_char_id, 'created', p_total_cents, p_currency,
    p_customer_name, p_customer_email, p_terms_accepted, p_terms_version, p_customer_ip,
    p_discord_id, p_contact_name, p_contact_email, p_contact_phone
  );

  INSERT INTO order_items (id, order_id, product_id, name, amount, price_cents, type)
  SELECT
    (item->>'id'),
    p_order_id,
    (item->>'product_id'),
    (item->>'name'),
    (item->>'amount')::INTEGER,
    (item->>'price_cents')::INTEGER,
    (item->>'type')
  FROM jsonb_array_elements(p_items) AS item;

  INSERT INTO payments (id, order_id, gateway, status, amount_cents)
  VALUES (p_payment_id, p_order_id, p_gateway, 'created', p_total_cents);

  RETURN p_order_id;
END;
$$ LANGUAGE plpgsql;
