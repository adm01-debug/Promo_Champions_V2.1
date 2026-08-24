-- Restore brute-force tracking INSERT capability on login_attempts.
-- Migration 20260619143547 dropped the service_role INSERT policy without
-- a replacement, leaving RLS-enabled table with no INSERT path → brute-force
-- protection silently disabled (check_failed_attempts always returns 0).
--
-- Strategy:
-- 1. Re-create the service_role INSERT policy (direct calls from edge functions
--    that run with the service_role key stay unaffected).
-- 2. Expose a SECURITY DEFINER RPC so client-side code or anon edge functions
--    can record attempts without needing a direct INSERT grant.

-- ── 1. Service-role INSERT policy ────────────────────────────────────────────
DROP POLICY IF EXISTS "Service role can insert login_attempts" ON public.login_attempts;

CREATE POLICY "Service role can insert login_attempts"
  ON public.login_attempts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ── 2. SECURITY DEFINER helper so server-side functions can call us safely ──
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_email      TEXT,
  p_ip_address INET    DEFAULT NULL,
  p_success    BOOLEAN DEFAULT FALSE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.login_attempts (email, ip_address, success, created_at)
  VALUES (
    p_email,
    p_ip_address,
    p_success,
    NOW()
  )
  ON CONFLICT DO NOTHING;   -- guard against accidental duplicate calls
END;
$$;

-- Allow only service_role to call this function; anon/authenticated must go
-- through the check_failed_attempts guard, not insert directly.
REVOKE ALL ON FUNCTION public.record_login_attempt(TEXT, INET, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(TEXT, INET, BOOLEAN) TO service_role;

COMMENT ON FUNCTION public.record_login_attempt IS
  'SECURITY DEFINER wrapper for recording login attempts. '
  'Bypasses RLS safely — caller must be service_role. '
  'Restores capability removed by migration 20260619143547.';
