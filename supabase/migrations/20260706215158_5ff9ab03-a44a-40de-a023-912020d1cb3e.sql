-- webhook_inbound_dedupe: adicionar colunas que faltam
ALTER TABLE public.webhook_inbound_dedupe
  ADD COLUMN IF NOT EXISTS first_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS hit_count integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS webhook_inbound_dedupe_first_seen_idx
  ON public.webhook_inbound_dedupe (first_seen_at);

-- webhook_inbound_log: novo
CREATE TABLE IF NOT EXISTS public.webhook_inbound_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at     timestamptz NOT NULL DEFAULT now(),
  source          text NOT NULL DEFAULT 'promogifts',
  event           text,
  correlation_key text,
  outcome         text NOT NULL,
  http_status     integer NOT NULL,
  request_id      text,
  error_message   text,
  payload_size    integer
);

CREATE INDEX IF NOT EXISTS webhook_inbound_log_received_idx
  ON public.webhook_inbound_log (received_at DESC);
CREATE INDEX IF NOT EXISTS webhook_inbound_log_outcome_idx
  ON public.webhook_inbound_log (outcome, received_at DESC);

GRANT SELECT ON public.webhook_inbound_log TO authenticated;
GRANT ALL    ON public.webhook_inbound_log TO service_role;

ALTER TABLE public.webhook_inbound_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webhook_inbound_log_service_all" ON public.webhook_inbound_log;
CREATE POLICY "webhook_inbound_log_service_all"
  ON public.webhook_inbound_log
  FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "webhook_inbound_log_authenticated_read" ON public.webhook_inbound_log;
CREATE POLICY "webhook_inbound_log_authenticated_read"
  ON public.webhook_inbound_log
  FOR SELECT
  TO authenticated
  USING (true);

-- trigger updated_at em quotes_inbound
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quotes_inbound_updated_at ON public.quotes_inbound;
CREATE TRIGGER quotes_inbound_updated_at
  BEFORE UPDATE ON public.quotes_inbound
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();