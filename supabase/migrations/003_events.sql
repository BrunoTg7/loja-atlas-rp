-- ═══════════════════════════════════════════════════════════════
-- Loja Atlas RP — MIGRAÇÃO: Sistema de Eventos
-- Execute este SQL no painel do Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. TABELA events
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  form_fields   JSONB DEFAULT '[]'::jsonb,
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ NOT NULL,
  is_enabled    BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE events ADD CONSTRAINT events_date_check CHECK (end_date >= start_date);

-- ───────────────────────────────────────────────────────────────
-- 2. TABELA event_participants
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_participants (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID REFERENCES events(id) ON DELETE CASCADE,
  participant_name  TEXT NOT NULL,
  participant_data  JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- 3. INDEXES
-- ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_events_enabled ON events(is_enabled);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);

-- ───────────────────────────────────────────────────────────────
-- 4. RLS (Row Level Security)
-- ───────────────────────────────────────────────────────────────

-- Habilitar RLS nas tabelas
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- EVENTS: Leitura pública apenas para eventos habilitados
CREATE POLICY "Public can view enabled events"
  ON events FOR SELECT
  USING (is_enabled = true);

-- EVENTS: Escrita apenas via service role (API routes admin)
-- Não criamos policy de INSERT/UPDATE/DELETE para anon --
-- o service_role bypassa RLS automaticamente.

-- EVENT_PARTICIPANTS: Qualquer um pode se inscrever (INSERT público)
CREATE POLICY "Anyone can register for events"
  ON event_participants FOR INSERT
  WITH CHECK (true);

-- EVENT_PARTICIPANTS: Leitura apenas via service role (admin)
-- Sem policy de SELECT para anon/service_role bypassa RLS.

-- ───────────────────────────────────────────────────────────────
-- 5. FUNÇÃO para updated_at automático
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();
