-- Adiciona coluna steam_id na tabela event_participants
ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS steam_id TEXT;

-- Cria index para busca rápida
CREATE INDEX IF NOT EXISTS idx_event_participants_steam ON event_participants(steam_id);

-- Constraint única para impedir inscrição duplicada no mesmo evento
ALTER TABLE event_participants ADD CONSTRAINT unique_event_steam UNIQUE (event_id, steam_id);
