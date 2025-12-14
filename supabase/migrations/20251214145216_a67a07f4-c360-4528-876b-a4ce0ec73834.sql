
-- =====================================================
-- SECURITY AUDIT FIX: Restringir acesso a dados sensíveis
-- =====================================================

-- 1. notification_preferences: restringir SELECT ao próprio usuário
DROP POLICY IF EXISTS "Authenticated users can read notification_preferences" ON public.notification_preferences;
CREATE POLICY "Users can view own notification preferences"
ON public.notification_preferences
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin_or_manager(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can update notification_preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own notification preferences"
ON public.notification_preferences
FOR UPDATE
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin_or_manager(auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can delete notification_preferences" ON public.notification_preferences;
CREATE POLICY "Users can delete own notification preferences"
ON public.notification_preferences
FOR DELETE
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin_or_manager(auth.uid())
);

-- 2. clients: restringir INSERT/UPDATE/DELETE a admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
CREATE POLICY "Admins and managers can insert clients"
ON public.clients
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update clients" ON public.clients;
CREATE POLICY "Admins and managers can update clients"
ON public.clients
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete clients" ON public.clients;
CREATE POLICY "Admins and managers can delete clients"
ON public.clients
FOR DELETE
USING (is_admin_or_manager(auth.uid()));

-- 3. products: restringir INSERT/UPDATE/DELETE a admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
CREATE POLICY "Admins and managers can insert products"
ON public.products
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
CREATE POLICY "Admins and managers can update products"
ON public.products
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
CREATE POLICY "Admins and managers can delete products"
ON public.products
FOR DELETE
USING (is_admin_or_manager(auth.uid()));

-- 4. playbooks: restringir INSERT/UPDATE/DELETE a admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert playbooks" ON public.playbooks;
CREATE POLICY "Admins and managers can insert playbooks"
ON public.playbooks
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update playbooks" ON public.playbooks;
CREATE POLICY "Admins and managers can update playbooks"
ON public.playbooks
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete playbooks" ON public.playbooks;
CREATE POLICY "Admins and managers can delete playbooks"
ON public.playbooks
FOR DELETE
USING (is_admin_or_manager(auth.uid()));

-- 5. playbook_items: restringir INSERT/UPDATE/DELETE a admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert playbook_items" ON public.playbook_items;
CREATE POLICY "Admins and managers can insert playbook_items"
ON public.playbook_items
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update playbook_items" ON public.playbook_items;
CREATE POLICY "Admins and managers can update playbook_items"
ON public.playbook_items
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete playbook_items" ON public.playbook_items;
CREATE POLICY "Admins and managers can delete playbook_items"
ON public.playbook_items
FOR DELETE
USING (is_admin_or_manager(auth.uid()));

-- 6. cadences: restringir INSERT/UPDATE/DELETE a admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert cadences" ON public.cadences;
CREATE POLICY "Admins and managers can insert cadences"
ON public.cadences
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update cadences" ON public.cadences;
CREATE POLICY "Admins and managers can update cadences"
ON public.cadences
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete cadences" ON public.cadences;
CREATE POLICY "Admins and managers can delete cadences"
ON public.cadences
FOR DELETE
USING (is_admin_or_manager(auth.uid()));

-- 7. cadence_steps: restringir INSERT/UPDATE/DELETE a admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert cadence_steps" ON public.cadence_steps;
CREATE POLICY "Admins and managers can insert cadence_steps"
ON public.cadence_steps
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update cadence_steps" ON public.cadence_steps;
CREATE POLICY "Admins and managers can update cadence_steps"
ON public.cadence_steps
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete cadence_steps" ON public.cadence_steps;
CREATE POLICY "Admins and managers can delete cadence_steps"
ON public.cadence_steps
FOR DELETE
USING (is_admin_or_manager(auth.uid()));

-- 8. objections_library: restringir INSERT/UPDATE/DELETE a admin/manager
DROP POLICY IF EXISTS "Authenticated users can insert objections_library" ON public.objections_library;
CREATE POLICY "Admins and managers can insert objections_library"
ON public.objections_library
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can update objections_library" ON public.objections_library;
CREATE POLICY "Admins and managers can update objections_library"
ON public.objections_library
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can delete objections_library" ON public.objections_library;
CREATE POLICY "Admins and managers can delete objections_library"
ON public.objections_library
FOR DELETE
USING (is_admin_or_manager(auth.uid()));
