
-- =============================================================
-- SECURITY HARDENING: Fix permissive RLS policies + MV exposure
-- =============================================================

-- 1) CLIENTS: remove blanket "true" SELECT — keep portfolio-scoped one
DROP POLICY IF EXISTS "Clients are viewable by authenticated users" ON public.clients;

-- 2) SALESPERSON_COMMISSION_CONFIGS: remove blanket "true" SELECT
DROP POLICY IF EXISTS "Ver comissões" ON public.salesperson_commission_configs;

-- 3) CLIENT_INTERACTIONS: remove both permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to read interactions" ON public.client_interactions;
DROP POLICY IF EXISTS "Users can view interactions of clients they can see" ON public.client_interactions;
-- Restore visibility for admins/managers on all interactions of clients in user's portfolio
CREATE POLICY "Portfolio interactions readable" ON public.client_interactions
FOR SELECT USING (
  public.is_admin_or_manager(auth.uid())
  OR auth.uid() = user_id
  OR client_id IN (
    SELECT client_id FROM public.client_portfolio
    WHERE salesperson_id = public.get_current_salesperson_id()
  )
);

-- 4) CS_TICKETS: scope by assigned salesperson, client portfolio, or admin
DROP POLICY IF EXISTS "CS data is viewable by authenticated users" ON public.cs_tickets;
CREATE POLICY "CS tickets scoped visibility" ON public.cs_tickets
FOR SELECT USING (
  public.is_admin_or_manager(auth.uid())
  OR assigned_to = public.get_current_salesperson_id()
  OR client_id IN (
    SELECT client_id FROM public.client_portfolio
    WHERE salesperson_id = public.get_current_salesperson_id()
  )
);

-- 5) ACCOUNT_PLANS: scope by creator / admin / manager
DROP POLICY IF EXISTS "Account plans are viewable by authenticated users" ON public.account_plans;
DROP POLICY IF EXISTS "Users can update account plans" ON public.account_plans;
CREATE POLICY "Account plans owner or admin can read" ON public.account_plans
FOR SELECT USING (
  public.is_admin_or_manager(auth.uid()) OR created_by = auth.uid()
);
CREATE POLICY "Account plans owner or admin can update" ON public.account_plans
FOR UPDATE USING (
  public.is_admin_or_manager(auth.uid()) OR created_by = auth.uid()
);

-- 6) CLIENT_RENEWALS: scope by portfolio ownership or admin
DROP POLICY IF EXISTS "CS renewals are viewable by authenticated users" ON public.client_renewals;
CREATE POLICY "Client renewals scoped visibility" ON public.client_renewals
FOR SELECT USING (
  public.is_admin_or_manager(auth.uid())
  OR client_id IN (
    SELECT client_id FROM public.client_portfolio
    WHERE salesperson_id = public.get_current_salesperson_id()
  )
);

-- 7) PRODUCT_USAGE: scope by portfolio or admin
DROP POLICY IF EXISTS "Product usage is viewable by authenticated users" ON public.product_usage;
CREATE POLICY "Product usage scoped visibility" ON public.product_usage
FOR SELECT USING (
  public.is_admin_or_manager(auth.uid())
  OR client_id IN (
    SELECT client_id FROM public.client_portfolio
    WHERE salesperson_id = public.get_current_salesperson_id()
  )
);

-- 8) SALESPERSON_PERFORMANCE_TELEMETRY: own record or admin/manager
DROP POLICY IF EXISTS "Allow read for all authenticated users" ON public.salesperson_performance_telemetry;
CREATE POLICY "Own telemetry or admin can read" ON public.salesperson_performance_telemetry
FOR SELECT USING (
  public.is_admin_or_manager(auth.uid())
  OR salesperson_id = public.get_current_salesperson_id()
);

-- 9) MATERIALIZED VIEW: revoke Data API access (still usable server-side)
REVOKE ALL ON public.mv_competitive_ranking FROM anon, authenticated;
