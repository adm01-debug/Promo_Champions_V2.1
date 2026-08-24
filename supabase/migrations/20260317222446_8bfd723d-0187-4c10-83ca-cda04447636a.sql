
-- =====================================================
-- SECURITY FIX: Final batch of permissive policies
-- =====================================================

-- Service-role tables (used by edge functions / CRON jobs)
-- These use {public} role because edge functions call with service_role key
-- The "true" WITH CHECK is acceptable for service_role-only access
-- since edge functions are server-side and trusted.
-- However, we should ensure unauthenticated clients can't abuse them.

-- login_attempts: Needs public INSERT for login flow (before auth)
-- password_reset_requests: Needs public INSERT for reset flow (before auth)
-- login_alerts: Edge function only
-- mfa_verification_attempts: Edge function only
-- These are intentionally public for pre-auth flows.

-- 1. FIX: victory_feed - restrict to own
DROP POLICY IF EXISTS "Authenticated can insert victory_feed" ON public.victory_feed;

CREATE POLICY "Users can insert own victory_feed"
  ON public.victory_feed FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

-- 2. FIX: quote_sync_logs - restrict to admin
DROP POLICY IF EXISTS "Service role can insert sync logs" ON public.quote_sync_logs;

CREATE POLICY "Admins can insert quote_sync_logs"
  ON public.quote_sync_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));
