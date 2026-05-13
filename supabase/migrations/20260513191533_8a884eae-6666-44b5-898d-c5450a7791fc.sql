-- Drop permissive policies for nps_surveys
DROP POLICY IF EXISTS "Authenticated users can create nps surveys" ON public.nps_surveys;
DROP POLICY IF EXISTS "Authenticated users can update nps surveys" ON public.nps_surveys;

-- Create secure policies for nps_surveys
CREATE POLICY "Salespeople can create their own nps surveys"
ON public.nps_surveys
FOR INSERT
TO authenticated
WITH CHECK (get_current_salesperson_id() = salesperson_id);

CREATE POLICY "Salespeople can update their own nps surveys"
ON public.nps_surveys
FOR UPDATE
TO authenticated
USING (get_current_salesperson_id() = salesperson_id OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Salespeople can delete their own nps surveys"
ON public.nps_surveys
FOR DELETE
TO authenticated
USING (get_current_salesperson_id() = salesperson_id OR is_admin_or_manager(auth.uid()));
