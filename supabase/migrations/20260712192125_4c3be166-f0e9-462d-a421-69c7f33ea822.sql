-- ============================================================================
-- Security hardening: remove permissive public-read policies
-- ============================================================================

-- 1) lead_churn_risk: substituir policy pública por acesso restrito
DROP POLICY IF EXISTS "Public read lead_churn_risk" ON public.lead_churn_risk;

CREATE POLICY "Admins and managers can read lead_churn_risk"
  ON public.lead_churn_risk
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Salespeople can read churn risk of their sales"
  ON public.lead_churn_risk
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.sales s
      JOIN public.salespeople sp ON sp.id = s.salesperson_id
      WHERE s.id = lead_churn_risk.sale_id
        AND sp.auth_user_id = auth.uid()
    )
  );

-- 2) quote_sync_logs: remover policy "Vendedores podem ver logs" (USING true)
DROP POLICY IF EXISTS "Vendedores podem ver logs" ON public.quote_sync_logs;
-- policies remanescentes: "Admins can view quote sync logs" e "Admins can view sync logs" já restringem a admins/managers.

-- 3) victory_feed: remover policy pública
DROP POLICY IF EXISTS "Anyone can view victory feed" ON public.victory_feed;
-- policy remanescente "Authenticated can read victory_feed" (auth.uid() IS NOT NULL) já cobre leitura.

-- 4) whatsapp_template_versions: remover policy "Venders can view active template versions" (USING true)
DROP POLICY IF EXISTS "Venders can view active template versions" ON public.whatsapp_template_versions;
-- policy remanescente "Versions are viewable by authenticated users" (auth.role() = 'authenticated') mantém acesso a usuários logados.