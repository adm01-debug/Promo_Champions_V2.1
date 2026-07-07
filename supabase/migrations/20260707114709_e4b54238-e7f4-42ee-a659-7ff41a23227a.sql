-- IMP11: índices + CHECKs defensivos em webhook_inbound_log / webhook_inbound_dedupe

-- ==== webhook_inbound_log ====
CREATE INDEX IF NOT EXISTS idx_webhook_inbound_log_received_at
  ON public.webhook_inbound_log (received_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_inbound_log_source_outcome_time
  ON public.webhook_inbound_log (source, outcome, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_webhook_inbound_log_correlation_key
  ON public.webhook_inbound_log (correlation_key)
  WHERE correlation_key IS NOT NULL;

ALTER TABLE public.webhook_inbound_log
  ADD CONSTRAINT chk_webhook_inbound_log_payload_size_non_negative
  CHECK (payload_size IS NULL OR payload_size >= 0);

ALTER TABLE public.webhook_inbound_log
  ADD CONSTRAINT chk_webhook_inbound_log_http_status_range
  CHECK (http_status BETWEEN 100 AND 599);

ALTER TABLE public.webhook_inbound_log
  ADD CONSTRAINT chk_webhook_inbound_log_outcome_allowed
  CHECK (outcome IN ('accepted','duplicate','rejected','error','ignored'));

-- ==== webhook_inbound_dedupe ====
ALTER TABLE public.webhook_inbound_dedupe
  ADD CONSTRAINT chk_webhook_inbound_dedupe_hit_count_non_negative
  CHECK (hit_count >= 0);

ALTER TABLE public.webhook_inbound_dedupe
  ADD CONSTRAINT chk_webhook_inbound_dedupe_payload_size
  CHECK (pg_column_size(payload) <= 262144);