
-- 1. Fix password_reset_requests INSERT: add ownership check
DROP POLICY IF EXISTS "Authenticated users can create reset requests" ON public.password_reset_requests;
DROP POLICY IF EXISTS "Users can insert own reset requests" ON public.password_reset_requests;
CREATE POLICY "Users can insert own reset requests"
  ON public.password_reset_requests FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND user_email = public.get_current_user_email()
    AND status = 'pending'
  );

-- 2. Fix circuit_breaker_events INSERT: restrict to admin/manager
DROP POLICY IF EXISTS "Authenticated users can log circuit breaker events" ON public.circuit_breaker_events;
CREATE POLICY "Admin/manager can log circuit breaker events"
  ON public.circuit_breaker_events FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 3. Fix price_alerts INSERT: restrict to admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert price_alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Admins can manage price_alerts" ON public.price_alerts;
CREATE POLICY "Admin/manager can insert price_alerts"
  ON public.price_alerts FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
