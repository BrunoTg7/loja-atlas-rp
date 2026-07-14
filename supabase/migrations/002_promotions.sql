-- ═══════════════════════════════════════════════════════════════
-- Loja Atlas RP — MIGRAÇÃO: Sistema de Promoções e Cupons
-- Execute este SQL no painel do Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. TABELA promo_codes (cupons percentuais livres ou com piso)
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
-- 2. TABELA promo_code_uses (registro de uso por usuário)
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
-- 3. TABELA product_promotions (desconto fixo por produto ou TODOS)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_promotions (
  id                TEXT PRIMARY KEY,
  product_id        TEXT NOT NULL,           -- 'ALL' = aplica a todos, ou ID específico
  discount_type     TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed_cents')),
  discount_value    INTEGER NOT NULL CHECK (discount_value > 0),
  min_order_cents   INTEGER DEFAULT 0 CHECK (min_order_cents >= 0),  -- valor mínimo do pedido
  payment_methods   TEXT,                    -- NULL = todos, ou 'pix', 'credit_card' (separado por vírgula)
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at         TIMESTAMPTZ DEFAULT NOW(),
  ends_at           TIMESTAMPTZ,
  created_by        TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscar promoções por produto (incluindo 'ALL')
CREATE INDEX IF NOT EXISTS idx_product_promotions_product ON product_promotions(product_id, active);
CREATE INDEX IF NOT EXISTS idx_product_promotions_active ON product_promotions(active);

-- ───────────────────────────────────────────────────────────────
-- 4. ALTERAÇÕES NA TABELA orders (rastreabilidade de descontos)
-- ───────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'promo_code_id') THEN
    ALTER TABLE orders ADD COLUMN promo_code_id TEXT REFERENCES promo_codes(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_cents') THEN
    ALTER TABLE orders ADD COLUMN discount_cents INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subtotal_cents') THEN
    ALTER TABLE orders ADD COLUMN subtotal_cents INTEGER;
  END IF;
END $$;
