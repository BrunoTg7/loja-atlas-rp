-- ═══════════════════════════════════════════════════════════════
-- Loja Atlas RP — MIGRAÇÃO: Cron Jobs via pg_cron (Supabase)
-- Execute este SQL no painel do Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════════════
-- Falta isso daqui: SELECT vault.store_secret('discord_delivery_webhook_url', 'SUA_URL_AQUI');
-- ───────────────────────────────────────────────────────────────
-- 1. HABILITAR EXTENSÕES NECESSÁRIAS
-- ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- ───────────────────────────────────────────────────────────────
-- 2. FUNÇÃO: expire_orders
-- Expira pedidos criados há mais de 24h com status created/pending
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION expire_orders()
RETURNS void AS $$
DECLARE
  cutoff timestamptz := now() - interval '24 hours';
  order_record RECORD;
BEGIN
  -- Atualizar pedidos para expired
  FOR order_record IN
    UPDATE orders
    SET status = 'expired',
        updated_at = now()
    WHERE status IN ('created', 'pending')
      AND created_at < cutoff
    RETURNING id
  LOOP
    -- Atualizar pagamentos vinculados
    UPDATE payments
    SET status = 'expired',
        updated_at = now()
    WHERE order_id = order_record.id
      AND status IN ('created', 'pending');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────
-- 3. FUNÇÃO: process_discord_queue
-- Envia mensagens pendentes do Discord via webhook (HTTP)
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION process_discord_queue()
RETURNS void AS $$
DECLARE
  queue_record RECORD;
  webhook_url text;
  payload jsonb;
  response record;
BEGIN
  -- Buscar URL do webhook das variáveis de configuração
  webhook_url := current_setting('app.settings.discord_webhook_url', true);

  -- Se não estiver configurado, tentar buscar de vault (Supabase secrets)
  IF webhook_url IS NULL OR webhook_url = '' THEN
    BEGIN
      webhook_url := vault.decrypt_secret('discord_delivery_webhook_url');
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Discord webhook URL não configurada';
      RETURN;
    END;
  END IF;

  -- Processar até 20 itens pendentes
  FOR queue_record IN
    SELECT id, payload, attempts
    FROM discord_queue
    WHERE status = 'pending'
      AND attempts < 5
    ORDER BY created_at ASC
    LIMIT 20
  LOOP
    BEGIN
      -- Remover signature do payload (igual ao código Node)
      payload := queue_record.payload - 'signature';

      -- Enviar via HTTP POST para o webhook do Discord
      SELECT INTO response *
      FROM http_post(
        webhook_url,
        jsonb_build_object(
          'content', '||FULFILLMENT_PAYLOAD:' || jsonb_build_object(
            'order_id', payload->>'order_id',
            'char_id', payload->>'char_id',
            'steam_hex', payload->>'steam_hex',
            'total_cents', (payload->>'total_cents')::int,
            'items', payload->>'items',
            'signature', queue_record.payload->>'signature'
          )::text || '||',
          'embeds', jsonb_build_array(jsonb_build_object(
            'title', 'Pagamento Aprovado — Entrega Solicitada',
            'color', 3403166,
            'timestamp', now()::text,
            'fields', jsonb_build_array(
              jsonb_build_object('name', 'Order ID', 'value', '`' || (payload->>'order_id') || '`', 'inline', true),
              jsonb_build_object('name', 'ID Personagem', 'value', '`' || (payload->>'char_id') || '`', 'inline', true),
              jsonb_build_object('name', 'Steam HEX', 'value', '`' || (payload->>'steam_hex') || '`', 'inline', false),
              jsonb_build_object('name', 'Valor', 'value', 'R$ ' || (((payload->>'total_cents')::int / 100.0)::numeric(10,2))::text, 'inline', true)
            )
          ))
        )::text,
        'application/json'
      );

      -- Marcar como enviado
      UPDATE discord_queue
      SET status = 'sent',
          sent_at = now()
      WHERE id = queue_record.id;

    EXCEPTION WHEN OTHERS THEN
      -- Incrementar tentativas
      UPDATE discord_queue
      SET attempts = queue_record.attempts + 1,
          last_error = SQLERRM,
          status = CASE WHEN queue_record.attempts + 1 >= 5 THEN 'failed' ELSE 'pending' END
      WHERE id = queue_record.id;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────
-- 4. AGENDAR CRON JOBS (pg_cron)
-- ───────────────────────────────────────────────────────────────

-- Limpar agendamentos antigos se existirem
SELECT cron.unschedule('expire-orders') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'expire-orders');
SELECT cron.unschedule('process-discord-queue') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-discord-queue');

-- Expire orders: roda a cada 15 minutos
SELECT cron.schedule(
  'expire-orders',
  '*/15 * * * *',
  $$SELECT expire_orders()$$
);

-- Process Discord queue: roda a cada minuto
SELECT cron.schedule(
  'process-discord-queue',
  '* * * * *',
  $$SELECT process_discord_queue()$$
);

-- ───────────────────────────────────────────────────────────────
-- 5. VERIFICAR CRON JOBS AGENDADOS
-- ───────────────────────────────────────────────────────────────
-- Execute esta query para ver os jobs ativos:
-- SELECT * FROM cron.job;
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
