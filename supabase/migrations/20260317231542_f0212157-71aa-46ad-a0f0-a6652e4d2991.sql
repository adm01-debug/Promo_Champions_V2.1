
-- 1. CRITICAL: salespeople SELECT - restrict sensitive columns
DROP POLICY IF EXISTS "Users can read salespeople" ON public.salespeople;
DROP POLICY IF EXISTS "Authenticated users can read salespeople" ON public.salespeople;

-- Allow users to see basic info (name, avatar) for all, but full data only for own record or admin/manager
CREATE POLICY "Users can read own full salesperson data"
  ON public.salespeople FOR SELECT TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 2. WARN: rate_limit_settings - remove duplicate permissive policy
DROP POLICY IF EXISTS "Authenticated users can read rate_limit_settings" ON public.rate_limit_settings;

-- 3. WARN: geo_blocked_regions - restrict to admin/manager
DROP POLICY IF EXISTS "Authenticated users can read geo_blocked_regions" ON public.geo_blocked_regions;
CREATE POLICY "Admin and managers can read geo_blocked_regions"
  ON public.geo_blocked_regions FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 4. WARN: permissions/role_permissions - restrict to admin/manager
DROP POLICY IF EXISTS "Authenticated users can read permissions" ON public.permissions;
CREATE POLICY "Admin and managers can read permissions"
  ON public.permissions FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read role_permissions" ON public.role_permissions;
CREATE POLICY "Admin and managers can read role_permissions"
  ON public.role_permissions FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));
