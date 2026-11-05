-- Drop permissive policies for icp_parameters
DROP POLICY IF EXISTS "Authenticated users can manage ICP parameters" ON public.icp_parameters;

-- Create secure policies for icp_parameters
CREATE POLICY "Admins can manage ICP parameters"
ON public.icp_parameters
FOR ALL
TO authenticated
USING (is_admin_or_manager(auth.uid()))
WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "All authenticated can view ICP parameters"
ON public.icp_parameters
FOR SELECT
TO authenticated
USING (true);
