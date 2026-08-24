-- Fix active_power_ups: restrict SELECT to own salesperson or admin/manager
DROP POLICY IF EXISTS "Authenticated can read power_ups" ON public.active_power_ups;

CREATE POLICY "Users can view own or admin can view all power-ups"
ON public.active_power_ups
FOR SELECT
TO authenticated
USING (
  salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'manager'::public.app_role)
);

-- Fix available_spins: restrict SELECT to own salesperson or admin/manager
DROP POLICY IF EXISTS "Anyone can read available spins" ON public.available_spins;

CREATE POLICY "Users can view own or admin can view all spins"
ON public.available_spins
FOR SELECT
TO authenticated
USING (
  salesperson_id IN (
    SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
  OR public.has_role(auth.uid(), 'manager'::public.app_role)
);

-- Fix realtime.messages: scope to authenticated with uid check
DROP POLICY IF EXISTS "Allow authenticated users to use realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can use realtime" ON realtime.messages;

CREATE POLICY "Authenticated users can use realtime"
ON realtime.messages
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);