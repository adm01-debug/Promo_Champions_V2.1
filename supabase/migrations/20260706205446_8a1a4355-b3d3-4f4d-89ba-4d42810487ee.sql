CREATE TABLE IF NOT EXISTS public.webhook_inbound_dedupe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_key text NOT NULL,
  event text NOT NULL,
  source text NOT NULL DEFAULT 'v4',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_webhook_inbound_dedupe_key
  ON public.webhook_inbound_dedupe (correlation_key);

CREATE INDEX IF NOT EXISTS idx_webhook_inbound_dedupe_received_at
  ON public.webhook_inbound_dedupe (received_at DESC);

GRANT SELECT ON public.webhook_inbound_dedupe TO authenticated;
GRANT ALL ON public.webhook_inbound_dedupe TO service_role;

ALTER TABLE public.webhook_inbound_dedupe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read inbound dedupe"
  ON public.webhook_inbound_dedupe
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));