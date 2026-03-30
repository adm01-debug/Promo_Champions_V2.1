
-- Fix overly permissive INSERT policy on score_change_logs
DROP POLICY IF EXISTS "System can insert score logs" ON public.score_change_logs;
CREATE POLICY "Authenticated can insert score logs"
  ON public.score_change_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Fix overly permissive SELECT on salesperson_custom_field_values  
DROP POLICY IF EXISTS "Authenticated can view field values" ON public.salesperson_custom_field_values;
CREATE POLICY "Authenticated can view field values"
  ON public.salesperson_custom_field_values FOR SELECT TO authenticated
  USING (public.is_authenticated());

-- Fix overly permissive SELECT on team_custom_fields
DROP POLICY IF EXISTS "Authenticated can view custom fields" ON public.team_custom_fields;
CREATE POLICY "Authenticated can view custom fields"
  ON public.team_custom_fields FOR SELECT TO authenticated
  USING (public.is_authenticated());
