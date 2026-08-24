
DROP POLICY IF EXISTS "System inserts executions" ON public.sequence_step_executions;

CREATE POLICY "Service role inserts executions"
  ON public.sequence_step_executions FOR INSERT
  TO service_role
  WITH CHECK (true);
