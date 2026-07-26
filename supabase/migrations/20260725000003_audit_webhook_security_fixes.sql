-- =============================================================================
-- AUDIT FIX ETAPA 3: Webhook Security
-- File: supabase/migrations/20260725000003_audit_webhook_security_fixes.sql
-- Created: 2026-07-25
-- Author: Claude Code — Senior Dev + PhD DB Audit
-- Severity: HIGH / MEDIUM
--
-- FINDINGS:
--   F1 [HIGH] dispatch-webhook/ winloss-webhook-dispatcher: SSRF via webhook URL
--             URLs nao sao validadas — utilizador autenticado pode fazer
--             requests para http://169.254.169.254 (metadata AWS/GCP), localhost,
--             ou redes internas. Bypassa RLS porque usa service_role.
--
--   F2 [MEDIUM] dispatch-webhook: nao ha rate-limit por subscription/URL destino.
--                Um seller com webhook mal configurado pode fazer DDoS a terceiros
--                usando a infraestrutura Supabase como proxy.
--
--   F3 [LOW] webhook-validator: z.record(z.any()) em quoteSync e crmEvent
--               permite campos arbitrary que poderao conter payloads invalidos.
--               Mudar para z.record(z.unknown()).
-- =============================================================================

BEGIN;

-- =============================================================================
-- F1: Tabela de ALLOWED WEBHOOK DESTINATIONS (SSRF mitigation)
-- Toda URL de webhook outbound deve ser validada contra esta lista.
-- Inclui Private IP ranges, loopback, link-local, metadata endpoints.
-- =============================================================================

CREATE TABLE IF NOT EXISTS webhook_allowed_domains (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern    TEXT        UNIQUE NOT NULL,   -- domain ou CIDR (ex: "api.acme.com", "*.internal")
  description TEXT,
  created_by UUID        REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocklist: nunca permitir estes destinos (SSRF blacklist prioritario)
INSERT INTO webhook_allowed_domains (pattern, description) VALUES
  ('169.254.169.254',    'AWS/GCP/Azure metadata endpoint — nunca permitir'),
  ('metadata.google.internal', 'GCP metadata — nunca permitir'),
  ('metadata',           'Generic metadata (todos os provedores)'),
  ('localhost',           'Loopback local'),
  ('127.0.0.0/8',        'Bloco loopback completo'),
  ('10.0.0.0/8',         'Rede privada Classe A'),
  ('172.16.0.0/12',      'Rede privada Classe B'),
  ('192.168.0.0/16',     'Rede privada Classe C'),
  ('0.0.0.0/8',          'This network'),
  ('224.0.0.0/4',        'Multicast'),
  ('240.0.0.0/5',         'Reservado'),
  ('::1',                 'IPv6 loopback'),
  ('fe80::/10',           'Link-local IPv6'),
  ('fc00::/7',            'IPv6 ULA')
ON CONFLICT (pattern) DO NOTHING;

-- Allowlist: dominios explicitamente permitidos
-- Adicionar aqui os dominios legitimos de webhooks
INSERT INTO webhook_allowed_domains (pattern, description) VALUES
  ('*.bitrix24.com',       'Bitrix24 webhooks'),
  ('bitrix24.com',         'Bitrix24 webhooks'),
  ('webhook.bitrix24.com', 'Bitrix24 webhooks'),
  ('api.promogifts.pt',    'PromoGifts API'),
  ('hooks.slack.com',      'Slack Incoming Webhooks'),
  ('hooks.zapier.com',     'Zapier webhooks'),
  ('webhook.zapier.com',   'Zapier webhooks'),
  ('discord.com',          'Discord webhooks'),
  ('discordapp.com',       'Discord webhooks'),
  ('maker.ifttt.com',      'IFTTT Maker')
ON CONFLICT (pattern) DO NOTHING;

-- FUNCTION: valida URL contra allowlist + blocklist
CREATE OR REPLACE FUNCTION is_url_allowed(p_url TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_host  TEXT;
  v_ip    INET;
  v_block BOOLEAN;
  v_allow BOOLEAN;
BEGIN
  IF p_url IS NULL OR p_url = '' THEN RETURN FALSE; END IF;

  -- Extrair host (remove protocolo e path)
  v_host := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(p_url, '^https?://', ''),
      '/.*$', ''
    )
  );
  -- Remove porta se presente
  v_host := REGEXP_REPLACE(v_host, ':\d+$', '');

  IF v_host = '' THEN RETURN FALSE; END IF;

  -- 1) Verificar blocklist (IP ranges privados/metadata)
  BEGIN
    v_ip := v_host::INET;
    -- Se converte para IP, verificar se e' privado/reservado
    SELECT EXISTS (
      SELECT 1 FROM webhook_allowed_domains wd
      WHERE v_ip <<= wd.pattern::INET
    ) INTO v_block;
    IF v_block THEN RETURN FALSE; END IF;
  EXCEPTION WHEN others THEN
    -- Nao e' IP — prosseguir com check de dominio
    NULL;
  END;

  -- 2) Verificar se corresponde a um pattern de blocklist (nomes)
  SELECT EXISTS (
    SELECT 1 FROM webhook_allowed_domains wd
    WHERE v_host = LOWER(wd.pattern)
      OR (wd.pattern LIKE '%.%' AND position(wd.pattern in v_host) > 0)
  ) INTO v_block
  FROM webhook_allowed_domains wd
  WHERE wd.pattern IN ('localhost','metadata','metadata.google.internal','169.254.169.254');

  IF v_block THEN RETURN FALSE; END IF;

  -- 3) Se ha allowlist entries (exceto blocklist), verificar match
  -- Se existem patterns de allowlist E nenhum match, bloquear
  -- Se NAO existem allowlist entries, permitir (backwards compat)
  SELECT EXISTS (
    SELECT 1
    FROM webhook_allowed_domains wd
    WHERE wd.pattern NOT IN (
      'localhost','metadata','metadata.google.internal','169.254.169.254',
      '127.0.0.0/8','10.0.0.0/8','172.16.0.0/12','192.168.0.0/16',
      '0.0.0.0/8','224.0.0.0/4','240.0.0.0/5',
      '::1','fe80::/10','fc00::/7'
    )
  ) INTO v_allow;

  IF v_allow THEN
    -- Verificar se o host corresponde a algum allowlist pattern
    SELECT EXISTS (
      SELECT 1 FROM webhook_allowed_domains wd
      WHERE
        -- Exato
        (v_host = LOWER(wd.pattern))
        OR
        -- Wildcard (*.domain.com)
        (wd.pattern LIKE '%.%'
         AND v_host LIKE '%.' || LOWER(wd.pattern))
    ) INTO v_allow;

    IF NOT v_allow THEN RETURN FALSE; END IF;
  END IF;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION is_url_allowed IS
  'Valida URLs de webhook contra blocklist (IP privado/metadata) e allowlist (dominios autorizados). '
  'Retorna FALSE para IPs privados, localhost, metadata endpoints, e dominios nao allowlisted. '
  'Usar SEMPRE antes de fazer fetch() em dispatch-webhook.';

-- RLS: apenas admins gerem a allowlist
ALTER TABLE webhook_allowed_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage webhook_allowed_domains"
  ON webhook_allowed_domains FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- =============================================================================
-- F2: Rate-limit por subscription no dispatch-webhook
-- Adicionar campo rate_limit_per_minute a winloss_webhook_subscriptions
-- =============================================================================

ALTER TABLE winloss_webhook_subscriptions
  ADD COLUMN IF NOT EXISTS rate_limit_per_minute INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS rate_limit_window_seconds INT DEFAULT 60;

COMMENT ON COLUMN winloss_webhook_subscriptions.rate_limit_per_minute IS
  'Maximo de envios por window_seconds. Default 60/min. Protege contra abuse.';

-- Criar tabela de rate-limit state ( sliding window counter )
CREATE TABLE IF NOT EXISTS webhook_dispatch_rate (
  subscription_id UUID NOT NULL REFERENCES winloss_webhook_subscriptions(id) ON DELETE CASCADE,
  window_start     TIMESTAMPTZ NOT NULL,
  count            INT NOT NULL DEFAULT 0,
  PRIMARY KEY (subscription_id, window_start)
);

ALTER TABLE webhook_dispatch_rate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages webhook_dispatch_rate"
  ON webhook_dispatch_rate FOR ALL
  TO service_role;

CREATE INDEX IF NOT EXISTS idx_webhook_dispatch_rate_cleanup
  ON webhook_dispatch_rate(window_start);

-- FUNCTION: check-and-increment rate limit para uma subscription
CREATE OR REPLACE FUNCTION check_webhook_rate_limit(
  p_subscription_id   UUID,
  p_window_seconds    INT DEFAULT 60,
  p_limit             INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_window TIMESTAMPTZ;
  v_count  INT;
BEGIN
  v_window := DATE_TRUNC('minute', NOW()) -
              (EXTRACT(MINUTE FROM NOW())::INT % (p_window_seconds / 60)) * INTERVAL '1 minute';

  SELECT count INTO v_count
  FROM webhook_dispatch_rate
  WHERE subscription_id = p_subscription_id
    AND window_start = v_window;

  IF v_count >= p_limit THEN
    RETURN FALSE;  -- rate limited
  END IF;

  INSERT INTO webhook_dispatch_rate (subscription_id, window_start, count)
  VALUES (p_subscription_id, v_window, 1)
  ON CONFLICT (subscription_id, window_start)
  DO UPDATE SET count = webhook_dispatch_rate.count + 1;

  RETURN TRUE;  -- allowed
END;
$$;

-- POLICY: service_role pode executar a funcao (edge function usa service_role key)
GRANT EXECUTE ON FUNCTION check_webhook_rate_limit(UUID, INT, INT) TO service_role;

-- Cleanup: trigger para remover entradas antigas de rate ( > 1 hora )
CREATE OR REPLACE FUNCTION cleanup_webhook_dispatch_rate()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM webhook_dispatch_rate
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- Cron job: a cada 5 minutos
-- (Nota: pg_cron no Supabase cloud — agendar via supabase config)
COMMENT ON FUNCTION cleanup_webhook_dispatch_rate IS
  'Remove entradas antigas da tabela webhook_dispatch_rate. '
  'Agendar via pg_cron: SELECT cron.schedule(...).';

COMMIT;
