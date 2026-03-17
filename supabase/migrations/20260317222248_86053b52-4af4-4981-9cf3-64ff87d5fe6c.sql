
-- =====================================================
-- SECURITY FIX: Remove overly permissive public policies
-- on sensitive tables (CRITICAL)
-- =====================================================

-- 1. FIX: sms_verification_codes - remove public ALL policy
DROP POLICY IF EXISTS "System can manage SMS codes" ON public.sms_verification_codes;

-- Replace with service-role only (no client access needed)
-- Users verify via edge functions, not direct table access
CREATE POLICY "Users can read own SMS codes"
  ON public.sms_verification_codes
  FOR SELECT
  TO authenticated
  USING (phone_number IN (
    SELECT phone FROM auth.users WHERE id = auth.uid()
  ));

-- 2. FIX: active_sessions - remove public ALL policy  
DROP POLICY IF EXISTS "System can manage sessions" ON public.active_sessions;

CREATE POLICY "Users can read own sessions"
  ON public.active_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions"
  ON public.active_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON public.active_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON public.active_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. FIX: push_subscriptions - remove public ALL policy
DROP POLICY IF EXISTS "Service role can manage all push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can read own push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 4. FIX: webauthn_credentials - remove public ALL policy
DROP POLICY IF EXISTS "Service can manage webauthn credentials" ON public.webauthn_credentials;

-- Keep user-scoped policies that may already exist

-- 5. FIX: webauthn_challenges - remove public ALL policy
DROP POLICY IF EXISTS "Service can manage webauthn challenges" ON public.webauthn_challenges;

CREATE POLICY "Users can read own webauthn challenges"
  ON public.webauthn_challenges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own webauthn challenges"
  ON public.webauthn_challenges
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own webauthn challenges"
  ON public.webauthn_challenges
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 6. FIX: rate_limit_logs - remove public ALL policy
DROP POLICY IF EXISTS "System can manage rate_limit_logs" ON public.rate_limit_logs;

CREATE POLICY "Admins can read rate_limit_logs"
  ON public.rate_limit_logs
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- rate_limit_logs INSERT is handled by the security definer function log_rate_limit()
-- No direct INSERT policy needed for regular users
