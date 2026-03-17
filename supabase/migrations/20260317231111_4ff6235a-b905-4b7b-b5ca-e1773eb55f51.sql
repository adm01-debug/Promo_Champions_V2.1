
-- Fix all remaining findings in one migration

-- 1. CRITICAL: icp_data SELECT - scope to own clients
DROP POLICY IF EXISTS "Authenticated users can read icp_data" ON public.icp_data;
CREATE POLICY "Users can read own client icp_data"
  ON public.icp_data FOR SELECT TO authenticated
  USING (
    client_id IN (SELECT client_id FROM public.client_portfolio WHERE salesperson_id = public.get_current_salesperson_id())
    OR public.is_admin_or_manager(auth.uid())
  );

-- 2. WARN: deal_stage_history - scope to own deals
DROP POLICY IF EXISTS "Authenticated users can read deal_stage_history" ON public.deal_stage_history;
CREATE POLICY "Users can read own deal_stage_history"
  ON public.deal_stage_history FOR SELECT TO authenticated
  USING (
    sale_id IN (SELECT id FROM public.sales WHERE salesperson_id = public.get_current_salesperson_id())
    OR public.is_admin_or_manager(auth.uid())
  );

-- 3. WARN: prospect_cadences - scope to own
DROP POLICY IF EXISTS "Authenticated users can read prospect_cadences" ON public.prospect_cadences;
CREATE POLICY "Users can read own prospect_cadences"
  ON public.prospect_cadences FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 4. WARN: daily_metrics - admin/manager only
DROP POLICY IF EXISTS "Authenticated users can read daily_metrics" ON public.daily_metrics;
CREATE POLICY "Admin and managers can read daily_metrics"
  ON public.daily_metrics FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 5. WARN: territory_history - scope to own
DROP POLICY IF EXISTS "Authenticated users can read territory_history" ON public.territory_history;
CREATE POLICY "Users can read own territory_history"
  ON public.territory_history FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 6. WARN: rate_limit_settings - admin only
DROP POLICY IF EXISTS "Authenticated users can read rate_limit_settings" ON public.rate_limit_settings;
CREATE POLICY "Admin can read rate_limit_settings"
  ON public.rate_limit_settings FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));
