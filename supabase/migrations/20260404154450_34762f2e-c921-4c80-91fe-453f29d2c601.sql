
DROP POLICY "Authenticated users can insert error logs" ON public.error_logs;
CREATE POLICY "Authenticated users can insert their own error logs"
ON public.error_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));
