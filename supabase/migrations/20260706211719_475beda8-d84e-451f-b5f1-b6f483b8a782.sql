
CREATE TABLE IF NOT EXISTS public.quotes_inbound (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL UNIQUE,
  quote_number TEXT,
  status TEXT,
  client_id TEXT,
  client_name TEXT,
  total NUMERIC(14,2),
  seller_email TEXT,
  source TEXT NOT NULL DEFAULT 'promogifts',
  source_updated_at TIMESTAMPTZ,
  last_event TEXT,
  last_correlation_key TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_inbound_received_at ON public.quotes_inbound (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_inbound_status ON public.quotes_inbound (status);
CREATE INDEX IF NOT EXISTS idx_quotes_inbound_client_id ON public.quotes_inbound (client_id);

GRANT SELECT ON public.quotes_inbound TO authenticated;
GRANT ALL  ON public.quotes_inbound TO service_role;

ALTER TABLE public.quotes_inbound ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins e managers podem ler quotes_inbound"
  ON public.quotes_inbound
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'manager'::app_role));

CREATE OR REPLACE FUNCTION public.set_quotes_inbound_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quotes_inbound_updated_at ON public.quotes_inbound;
CREATE TRIGGER trg_quotes_inbound_updated_at
  BEFORE UPDATE ON public.quotes_inbound
  FOR EACH ROW EXECUTE FUNCTION public.set_quotes_inbound_updated_at();
