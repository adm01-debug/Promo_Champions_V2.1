
-- 1. CRITICAL: price_alerts UPDATE - restrict to admin/manager
DROP POLICY IF EXISTS "Authenticated users can update price_alerts" ON public.price_alerts;
CREATE POLICY "Admin and managers can update price_alerts"
  ON public.price_alerts FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 2. WARN: deal_chat_history INSERT - restrict to own salesperson_id
DROP POLICY IF EXISTS "Authenticated users can insert deal_chat_history" ON public.deal_chat_history;
CREATE POLICY "Users can insert own deal_chat_history"
  ON public.deal_chat_history FOR INSERT TO authenticated
  WITH CHECK (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 3. WARN: digital_signatures INSERT - restrict created_by
DROP POLICY IF EXISTS "Authenticated users can insert digital_signatures" ON public.digital_signatures;
CREATE POLICY "Users can insert own digital_signatures"
  ON public.digital_signatures FOR INSERT TO authenticated
  WITH CHECK (
    created_by = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 4. WARN: xp_history SELECT - scope to own records
DROP POLICY IF EXISTS "Authenticated users can read xp_history" ON public.xp_history;
CREATE POLICY "Users can read own xp_history"
  ON public.xp_history FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 5. WARN: price_history INSERT - restrict to admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert price_history" ON public.price_history;
CREATE POLICY "Admin and managers can insert price_history"
  ON public.price_history FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 6. WARN: circuit_breaker_events INSERT - restrict to service_role
DROP POLICY IF EXISTS "Authenticated users can insert circuit_breaker_events" ON public.circuit_breaker_events;
CREATE POLICY "Service role can insert circuit_breaker_events"
  ON public.circuit_breaker_events FOR INSERT TO service_role
  WITH CHECK (true);
