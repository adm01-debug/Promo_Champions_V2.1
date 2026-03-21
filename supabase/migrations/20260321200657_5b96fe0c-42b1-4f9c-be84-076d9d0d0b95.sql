
-- Fix: Restrict sdr_alert_history SELECT to admins only (contains admin_emails)
DROP POLICY IF EXISTS "Admins and managers can view SDR alerts" ON sdr_alert_history;
DROP POLICY IF EXISTS "Authenticated users can read sdr_alert_history" ON sdr_alert_history;
DROP POLICY IF EXISTS "Admin and managers can read sdr_alert_history" ON sdr_alert_history;

-- Only admins can see alert history (it contains admin email addresses)
CREATE POLICY "Only admins can view SDR alert history" ON sdr_alert_history
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
