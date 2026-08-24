-- Add INSERT, UPDATE, DELETE policies for daily_metrics (admin/manager only)
CREATE POLICY "Admins and managers can insert daily_metrics"
ON public.daily_metrics
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update daily_metrics"
ON public.daily_metrics
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete daily_metrics"
ON public.daily_metrics
FOR DELETE
USING (is_admin_or_manager(auth.uid()));

-- Add INSERT, UPDATE, DELETE policies for category_metrics (admin/manager only)
CREATE POLICY "Admins and managers can insert category_metrics"
ON public.category_metrics
FOR INSERT
WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update category_metrics"
ON public.category_metrics
FOR UPDATE
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete category_metrics"
ON public.category_metrics
FOR DELETE
USING (is_admin_or_manager(auth.uid()));