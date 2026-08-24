
-- Fix salespeople: replace overly permissive SELECT
DROP POLICY IF EXISTS "Authenticated users can read salespeople" ON public.salespeople;
DROP POLICY IF EXISTS "Users can read own salesperson record" ON public.salespeople;
CREATE POLICY "Users can read own salesperson record"
  ON public.salespeople FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR public.is_admin_or_manager(auth.uid())
  );

-- Fix rate_limit_settings: remove permissive policy
DROP POLICY IF EXISTS "Authenticated can view rate_limit_settings" ON public.rate_limit_settings;

-- Fix salespeople_public view: it's a VIEW not a table, no RLS needed
-- But ensure it filters only active users and excludes auth_user_id
DROP VIEW IF EXISTS public.salespeople_public;
CREATE VIEW public.salespeople_public
WITH (security_invoker = on) AS
SELECT id, name, avatar_url, role, is_active
FROM public.salespeople
WHERE is_active = true;

GRANT SELECT ON public.salespeople_public TO authenticated;
