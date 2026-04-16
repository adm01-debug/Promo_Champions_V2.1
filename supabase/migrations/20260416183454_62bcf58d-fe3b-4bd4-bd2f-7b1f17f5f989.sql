
DROP POLICY IF EXISTS "System inserts executions" ON public.workflow_executions;

CREATE POLICY "Users insert own executions"
ON public.workflow_executions FOR INSERT TO authenticated
WITH CHECK (triggered_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
