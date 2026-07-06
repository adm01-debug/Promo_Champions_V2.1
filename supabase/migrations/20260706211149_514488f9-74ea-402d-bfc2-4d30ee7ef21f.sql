
CREATE TABLE IF NOT EXISTS public.quote_sync_inbound_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  correlation_key TEXT,
  event TEXT,
  status TEXT NOT NULL,
  http_status INTEGER NOT NULL,
  error_message TEXT,
  external_quote_id TEXT,
  quote_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT NOT NULL DEFAULT 'v4',
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qs_inbound_log_received_at ON public.quote_sync_inbound_log (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_qs_inbound_log_status ON public.quote_sync_inbound_log (status);
CREATE INDEX IF NOT EXISTS idx_qs_inbound_log_correlation ON public.quote_sync_inbound_log (correlation_key);

GRANT SELECT ON public.quote_sync_inbound_log TO authenticated;
GRANT ALL ON public.quote_sync_inbound_log TO service_role;

ALTER TABLE public.quote_sync_inbound_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read quote sync inbound log"
  ON public.quote_sync_inbound_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Cron para purga
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  PERFORM cron.unschedule('purge-webhook-inbound-dedupe-30d');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  PERFORM cron.unschedule('purge-quote-sync-inbound-log-30d');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'purge-webhook-inbound-dedupe-30d',
  '0 3 * * *',
  $$DELETE FROM public.webhook_inbound_dedupe WHERE received_at < now() - interval '30 days';$$
);

SELECT cron.schedule(
  'purge-quote-sync-inbound-log-30d',
  '15 3 * * *',
  $$DELETE FROM public.quote_sync_inbound_log WHERE received_at < now() - interval '30 days';$$
);
