-- Recebe os designs criados/alterados no Promo Design (fluxo design.created / design.updated).
--
-- Espelho local do design para o CRM dos vendedores: o vendedor precisa enxergar que existe
-- arte aprovada para um produto antes de montar a proposta. A chave de idempotencia e o
-- proprio id do design no Promo Design.
CREATE TABLE IF NOT EXISTS public.designs_inbound (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  product_name TEXT,
  product_sku TEXT,
  thumbnail_url TEXT,
  seller_email TEXT,
  last_event TEXT,
  last_correlation_key TEXT,
  source TEXT NOT NULL DEFAULT 'promo_design',
  source_updated_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_designs_inbound_received_at ON public.designs_inbound (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_designs_inbound_product_sku ON public.designs_inbound (product_sku);
CREATE INDEX IF NOT EXISTS idx_designs_inbound_seller_email ON public.designs_inbound (seller_email);

GRANT SELECT ON public.designs_inbound TO authenticated;
GRANT ALL ON public.designs_inbound TO service_role;

ALTER TABLE public.designs_inbound ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins e managers podem ler designs_inbound" ON public.designs_inbound;
CREATE POLICY "Admins e managers podem ler designs_inbound"
  ON public.designs_inbound
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
    OR seller_email = auth.jwt() ->> 'email'
  );

CREATE OR REPLACE FUNCTION public.set_designs_inbound_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_designs_inbound_updated_at ON public.designs_inbound;
CREATE TRIGGER trg_designs_inbound_updated_at
  BEFORE UPDATE ON public.designs_inbound
  FOR EACH ROW
  EXECUTE FUNCTION public.set_designs_inbound_updated_at();