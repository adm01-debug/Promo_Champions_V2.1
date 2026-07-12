-- FASE 1 — Hardening de Segurança
-- 1. quotes_inbound: remover write público (edge function usa service_role)
DROP POLICY IF EXISTS "Edge function insert quotes_inbound" ON public.quotes_inbound;
DROP POLICY IF EXISTS "Edge function update quotes_inbound" ON public.quotes_inbound;

-- service_role já ignora RLS via GRANT ALL; garantir grant explícito
GRANT ALL ON public.quotes_inbound TO service_role;
REVOKE INSERT, UPDATE ON public.quotes_inbound FROM anon, authenticated;

-- 2. monthly_sales_summary: remover leitura pública anônima
DROP POLICY IF EXISTS "Summary viewable by everyone" ON public.monthly_sales_summary;

CREATE POLICY "Managers e admins podem ver monthly_sales_summary"
  ON public.monthly_sales_summary
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
  );

REVOKE SELECT ON public.monthly_sales_summary FROM anon;
GRANT SELECT ON public.monthly_sales_summary TO authenticated;

-- 3. territories: remover policy duplicada com role {public}
DROP POLICY IF EXISTS "Territories are viewable by everyone" ON public.territories;
REVOKE SELECT ON public.territories FROM anon;
GRANT SELECT ON public.territories TO authenticated;