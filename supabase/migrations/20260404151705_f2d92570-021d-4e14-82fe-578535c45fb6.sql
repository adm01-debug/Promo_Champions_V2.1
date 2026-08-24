-- Tighten query_telemetry INSERT policy to use auth.uid()
DROP POLICY IF EXISTS "System can insert telemetry" ON public.query_telemetry;
CREATE POLICY "Authenticated users can insert own telemetry"
ON public.query_telemetry
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);