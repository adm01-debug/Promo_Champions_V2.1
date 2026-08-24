-- 1) Products: default cost fallback
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS default_cost NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS cost_synced_at TIMESTAMPTZ;

-- 2) Sales: cost snapshot + generated markup columns
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS total_cost NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS cost_source TEXT,
  ADD COLUMN IF NOT EXISTS cost_synced_at TIMESTAMPTZ;

-- Constraint for cost_source (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sales_cost_source_check'
  ) THEN
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_cost_source_check
      CHECK (cost_source IS NULL OR cost_source IN ('promo_gifts','manual','product_default'));
  END IF;
END$$;

-- Generated columns (drop-and-recreate safely if they exist)
ALTER TABLE public.sales DROP COLUMN IF EXISTS margin_amount;
ALTER TABLE public.sales DROP COLUMN IF EXISTS markup_pct;

ALTER TABLE public.sales
  ADD COLUMN margin_amount NUMERIC(14,2)
  GENERATED ALWAYS AS (
    CASE
      WHEN total_cost IS NULL OR amount IS NULL THEN NULL
      ELSE ROUND((amount - total_cost)::numeric, 2)
    END
  ) STORED;

ALTER TABLE public.sales
  ADD COLUMN markup_pct NUMERIC(8,2)
  GENERATED ALWAYS AS (
    CASE
      WHEN total_cost IS NULL OR total_cost = 0 OR amount IS NULL THEN NULL
      ELSE ROUND(((amount - total_cost) / total_cost * 100)::numeric, 2)
    END
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_sales_markup_pct ON public.sales(markup_pct);
CREATE INDEX IF NOT EXISTS idx_sales_cost_source ON public.sales(cost_source);

-- 3) View that masks cost details for non-privileged users.
--    Salesperson can only see markup_pct; unit_cost/total_cost/margin_amount are NULL for them.
CREATE OR REPLACE VIEW public.sales_with_markup
WITH (security_invoker = true) AS
SELECT
  s.id,
  s.client_id,
  s.client_name,
  s.product_id,
  s.product_name,
  s.sku,
  s.amount,
  s.status,
  s.salesperson_id,
  s.sdr_id,
  s.closer_id,
  s.created_at,
  s.updated_at,
  s.markup_pct,
  s.cost_source,
  s.cost_synced_at,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
    THEN s.unit_cost
    ELSE NULL
  END AS unit_cost,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
    THEN s.total_cost
    ELSE NULL
  END AS total_cost,
  CASE
    WHEN public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'manager'::app_role)
    THEN s.margin_amount
    ELSE NULL
  END AS margin_amount
FROM public.sales s;

GRANT SELECT ON public.sales_with_markup TO authenticated;
GRANT SELECT ON public.sales_with_markup TO service_role;

COMMENT ON COLUMN public.sales.unit_cost IS 'Custo unitário snapshot no momento da venda (fonte: Promo Gifts ou manual).';
COMMENT ON COLUMN public.sales.total_cost IS 'Custo total da venda (unit_cost * quantidade quando aplicável).';
COMMENT ON COLUMN public.sales.markup_pct IS 'Coluna calculada: ((amount - total_cost) / total_cost) * 100.';
COMMENT ON COLUMN public.sales.margin_amount IS 'Coluna calculada: amount - total_cost.';
COMMENT ON VIEW public.sales_with_markup IS 'Visão de vendas com markup; mascara custos absolutos para vendedores.';