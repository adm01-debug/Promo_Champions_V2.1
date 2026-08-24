-- Drop permissive policies for pipeline_stages
DROP POLICY IF EXISTS "Authenticated users can manage pipeline stages" ON public.pipeline_stages;

-- Create secure policies for pipeline_stages
CREATE POLICY "Only admins can manage pipeline stages"
ON public.pipeline_stages
FOR ALL
TO authenticated
USING (is_admin_or_manager(auth.uid()))
WITH CHECK (is_admin_or_manager(auth.uid()));
