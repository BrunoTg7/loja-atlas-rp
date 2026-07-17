-- ═══════════════════════════════════════════════════════════════
-- Loja Atlas RP — Schema de Pagamento (v5 — Promoções)
-- Execute este SQL no painel do Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. TABELA orders (com auditoria de termos jurídicos)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                    TEXT PRIMARY KEY,
  user_steam_id         TEXT NOT NULL,
  steam_hex             TEXT NOT NULL,
  char_id               TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'created'
                        CHECK (status IN (
                          'created','pending','processing','approved',
                          'failed','cancelled','expired','refunded',
                          'chargeback','under_review'
                        )),
  total_cents           INTEGER NOT NULL CHECK (total_cents > 0),
  currency              TEXT NOT NULL DEFAULT 'BRL',
  customer_name         TEXT,
  customer_email        TEXT,

  -- Auditoria de Aceite dos Termos de Uso (Blindagem Jurídica)
  terms_accepted        BOOLEAN NOT NULL DEFAULT FALSE CHECK (terms_accepted = TRUE),
  terms_version         TEXT NOT NULL DEFAULT 'v1.0',
  customer_ip           TEXT,

  -- Dados de contato do checkout
  discord_id            TEXT,
  contact_name          TEXT,
  contact_email         TEXT,
  contact_phone         TEXT,

  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_steam_id);
CREATE INDEX IF NOT EXISTS idx_orders_char_id ON orders(char_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ───────────────────────────────────────────────────────────────
-- 2. TABELA order_items
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL,
  name        TEXT NOT NULL,
  amount      INTEGER NOT NULL CHECK (amount > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  type        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ───────────────────────────────────────────────────────────────
-- 3. TABELA payments
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              TEXT PRIMARY KEY,
  order_id        TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  gateway         TEXT NOT NULL,
  gateway_id      TEXT,
  status          TEXT NOT NULL DEFAULT 'created'
                  CHECK (status IN (
                    'created','pending','processing','approved',
                    'failed','cancelled','expired','refunded','chargeback','under_review'
                  )),
  method          TEXT,
  amount_cents    INTEGER NOT NULL CHECK (amount_cents > 0),
  pix_code        TEXT,
  pix_qr_code     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  paid_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_gateway_id ON payments(gateway_id) WHERE gateway_id IS NOT NULL;

-- ───────────────────────────────────────────────────────────────
-- 4. TABELA payment_events (idempotência de webhooks)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_events (
  id                TEXT PRIMARY KEY,
  payment_id        TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  gateway_event_id  TEXT NOT NULL,
  event_type        TEXT NOT NULL,
  gateway_event      TEXT,
  processed         BOOLEAN DEFAULT FALSE,
  processed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (payment_id, gateway_event_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_processed ON payment_events(processed);

-- ───────────────────────────────────────────────────────────────
-- 5. TABELA payment_logs (LGPD — dados anonimizáveis)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_logs (
  id            TEXT PRIMARY KEY,
  payment_id    TEXT REFERENCES payments(id) ON DELETE SET NULL,
  order_id      TEXT REFERENCES orders(id) ON DELETE SET NULL,
  event_type    TEXT NOT NULL,
  gateway       TEXT NOT NULL,
  headers       JSONB,
  payload       JSONB,
  ip_address    TEXT,
  status        TEXT,
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at);

-- ───────────────────────────────────────────────────────────────
-- 6. TABELA discord_queue (fila persistente de entrega)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discord_queue (
  id            TEXT PRIMARY KEY,
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payload       JSONB NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  attempts      INTEGER NOT NULL DEFAULT 0,
  last_error    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  sent_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_discord_queue_status ON discord_queue(status);

-- ───────────────────────────────────────────────────────────────
-- 7. FUNÇÃO ATÔMICA create_order_with_payment
-- ───────────────────────────────────────────────────────────────
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

-- ───────────────────────────────────────────────────────────────
-- 8. TABELA promo_codes (cupons percentuais livres ou com piso)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id                TEXT PRIMARY KEY,
  code              TEXT NOT NULL UNIQUE,
  discount_type     TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed_cents')),
  discount_value    INTEGER NOT NULL CHECK (discount_value > 0),
  min_order_cents   INTEGER DEFAULT 0 CHECK (min_order_cents >= 0),
  max_uses_total    INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  uses_count        INTEGER NOT NULL DEFAULT 0,
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at         TIMESTAMPTZ DEFAULT NOW(),
  ends_at           TIMESTAMPTZ,
  created_by        TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(active);

-- ───────────────────────────────────────────────────────────────
-- 9. TABELA promo_code_uses (registro de uso por usuário)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_code_uses (
  id                      TEXT PRIMARY KEY,
  promo_code_id           TEXT NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  order_id                TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_steam_id           TEXT NOT NULL,
  discount_applied_cents  INTEGER NOT NULL,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (promo_code_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_code_uses_user ON promo_code_uses(promo_code_id, user_steam_id);

-- ───────────────────────────────────────────────────────────────
-- 10. TABELA product_promotions (desconto fixo por produto)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_promotions (
  id                TEXT PRIMARY KEY,
  product_id        TEXT NOT NULL,
  discount_type     TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed_cents')),
  discount_value    INTEGER NOT NULL CHECK (discount_value > 0),
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at         TIMESTAMPTZ DEFAULT NOW(),
  ends_at           TIMESTAMPTZ,
  created_by        TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_promotions_active_product
  ON product_promotions(product_id)
  WHERE active = TRUE;

-- ───────────────────────────────────────────────────────────────
-- 11. ALTERAÇÕES NA TABELA orders (rastreabilidade de descontos)
-- ───────────────────────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS promo_code_id TEXT REFERENCES promo_codes(id),
  ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal_cents INTEGER;
