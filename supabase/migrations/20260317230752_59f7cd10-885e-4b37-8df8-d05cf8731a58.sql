
-- 1. CRITICAL: salespeople UPDATE - create secure update function
CREATE OR REPLACE FUNCTION public.update_own_profile(
  p_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE salespeople
  SET
    name = COALESCE(p_name, name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE auth_user_id = auth.uid();
END;
$$;

-- Replace permissive UPDATE policy with admin-only
DROP POLICY IF EXISTS "Users can update own salesperson record" ON public.salespeople;

CREATE POLICY "Admin can update any salesperson"
  ON public.salespeople FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 2. CRITICAL: login_attempts - move to service_role
DROP POLICY IF EXISTS "System can insert login_attempts" ON public.login_attempts;
CREATE POLICY "Service role can insert login_attempts"
  ON public.login_attempts FOR INSERT TO service_role
  WITH CHECK (true);

-- 3. CRITICAL: password_reset_requests - restrict status + require auth
DROP POLICY IF EXISTS "Anyone can request password reset" ON public.password_reset_requests;
CREATE POLICY "Authenticated users can request password reset"
  ON public.password_reset_requests FOR INSERT TO authenticated
  WITH CHECK (status = 'pending');
