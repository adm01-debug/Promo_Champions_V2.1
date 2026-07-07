-- IMP12 v3: incluindo TODOS os valores existentes

ALTER TABLE public.external_seller_map
  ADD CONSTRAINT chk_external_seller_map_source_allowed
  CHECK (external_source IN ('bitrix24','gift_store','promogifts','n8n','manual','api'));

ALTER TABLE public.external_seller_map
  ADD CONSTRAINT chk_external_seller_map_email_format
  CHECK (external_email IS NULL OR external_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

ALTER TABLE public.external_seller_map
  ADD CONSTRAINT chk_external_seller_map_external_id_len
  CHECK (char_length(external_id) BETWEEN 1 AND 128);

ALTER TABLE public.quote_sync_inbound_log
  ADD CONSTRAINT chk_qs_inbound_log_status_allowed
  CHECK (status IN ('accepted','duplicate','rejected','error','ignored','processed','method_not_allowed','unauthorized','not_found','bad_request'));

ALTER TABLE public.quote_sync_inbound_log
  ADD CONSTRAINT chk_qs_inbound_log_http_status_range
  CHECK (http_status BETWEEN 100 AND 599);

ALTER TABLE public.quote_sync_inbound_log
  ADD CONSTRAINT chk_qs_inbound_log_source_allowed
  CHECK (source IN ('gift_store','promogifts','bitrix24','manual','api','webhook','n8n','v4'));

ALTER TABLE public.quote_sync_inbound_log
  ADD CONSTRAINT chk_qs_inbound_log_payload_size
  CHECK (pg_column_size(payload) <= 262144);

CREATE INDEX IF NOT EXISTS idx_qs_inbound_log_source_status_time
  ON public.quote_sync_inbound_log (source, status, received_at DESC);

ALTER TABLE public.maintenance_log
  ADD CONSTRAINT chk_maintenance_log_status_allowed
  CHECK (status IN ('running','completed','failed','skipped'));

ALTER TABLE public.maintenance_log
  ADD CONSTRAINT chk_maintenance_log_rows_affected_non_negative
  CHECK (rows_affected IS NULL OR rows_affected >= 0);

ALTER TABLE public.maintenance_log
  ADD CONSTRAINT chk_maintenance_log_completed_after_started
  CHECK (completed_at IS NULL OR completed_at >= started_at);

CREATE INDEX IF NOT EXISTS idx_maintenance_log_started_at
  ON public.maintenance_log (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_log_status
  ON public.maintenance_log (status)
  WHERE status IN ('running','failed');