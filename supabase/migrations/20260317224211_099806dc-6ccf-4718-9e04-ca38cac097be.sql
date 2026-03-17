
-- Fix document_signers: change INSERT/UPDATE from {public} to {authenticated} with proper scoping
DROP POLICY IF EXISTS "Authenticated users can insert document_signers" ON public.document_signers;
DROP POLICY IF EXISTS "Authenticated users can update document_signers" ON public.document_signers;

CREATE POLICY "Authenticated users can insert document_signers"
  ON public.document_signers FOR INSERT TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT id FROM public.digital_signatures 
      WHERE created_by = public.get_current_salesperson_id()
    )
    OR public.is_admin_or_manager(auth.uid())
  );

CREATE POLICY "Authenticated users can update document_signers"
  ON public.document_signers FOR UPDATE TO authenticated
  USING (
    document_id IN (
      SELECT id FROM public.digital_signatures 
      WHERE created_by = public.get_current_salesperson_id()
    )
    OR public.is_admin_or_manager(auth.uid())
  );

-- Tighten logging tables: restrict to service_role where possible
-- password_reset_requests needs public access for pre-auth flow, keep it
-- login_attempts needs public access for pre-auth flow, keep it

-- For edge-function-only tables, restrict INSERT to service_role
DROP POLICY IF EXISTS "Service role can insert sync logs" ON public.bitrix24_sync_logs;
CREATE POLICY "Service role can insert sync logs"
  ON public.bitrix24_sync_logs FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert email_logs" ON public.email_logs;
CREATE POLICY "Service role can insert email_logs"
  ON public.email_logs FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service can insert geo_access_logs" ON public.geo_access_logs;
CREATE POLICY "Service can insert geo_access_logs"
  ON public.geo_access_logs FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert alerts" ON public.login_alerts;
CREATE POLICY "System can insert alerts"
  ON public.login_alerts FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert MFA attempts" ON public.mfa_verification_attempts;
CREATE POLICY "System can insert MFA attempts"
  ON public.mfa_verification_attempts FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert sdr_alert_history" ON public.sdr_alert_history;
CREATE POLICY "Service role can insert sdr_alert_history"
  ON public.sdr_alert_history FOR INSERT TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert alert history" ON public.security_alert_history;
CREATE POLICY "Service role can insert alert history"
  ON public.security_alert_history FOR INSERT TO service_role
  WITH CHECK (true);
