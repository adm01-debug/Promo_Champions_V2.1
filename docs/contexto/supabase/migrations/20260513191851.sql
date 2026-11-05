-- Secure client_interactions
DROP POLICY IF EXISTS "Users can insert interactions" ON public.client_interactions;
CREATE POLICY "Users can insert own interactions"
ON public.client_interactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own interactions"
ON public.client_interactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR is_admin_or_manager(auth.uid()));

-- Secure intent_audit_logs
DROP POLICY IF EXISTS "Permitir inserção pelo sistema" ON public.intent_audit_logs;
CREATE POLICY "Authenticated users can view intent audit logs"
ON public.intent_audit_logs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert intent audit logs"
ON public.intent_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Secure deal_health_history
DROP POLICY IF EXISTS "System can insert health history" ON public.deal_health_history;
CREATE POLICY "Authenticated users can view health history"
ON public.deal_health_history
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert health history"
ON public.deal_health_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Secure lead_detailed_logs
DROP POLICY IF EXISTS "Users can insert logs for their clients" ON public.lead_detailed_logs;
CREATE POLICY "Users can insert own logs"
ON public.lead_detailed_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view own logs"
ON public.lead_detailed_logs
FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR is_admin_or_manager(auth.uid()));

-- Secure cadence_funnel_rules
DROP POLICY IF EXISTS "Users can manage funnel rules" ON public.cadence_funnel_rules;
CREATE POLICY "Only admins can manage funnel rules"
ON public.cadence_funnel_rules
FOR ALL
TO authenticated
USING (is_admin_or_manager(auth.uid()))
WITH CHECK (is_admin_or_manager(auth.uid()));

-- Secure mql_qualifications
DROP POLICY IF EXISTS "Salespeople can manage qualifications" ON public.mql_qualifications;
CREATE POLICY "Users can manage own qualifications"
ON public.mql_qualifications
FOR ALL
TO authenticated
USING (auth.uid() = qualified_by OR is_admin_or_manager(auth.uid()))
WITH CHECK (auth.uid() = qualified_by OR is_admin_or_manager(auth.uid()));

-- Secure call_critical_moments
DROP POLICY IF EXISTS "ccm_system_insert" ON public.call_critical_moments;
CREATE POLICY "Users can view own critical moments"
ON public.call_critical_moments
FOR SELECT
TO authenticated
USING (get_current_salesperson_id() = salesperson_id OR is_admin_or_manager(auth.uid()));

CREATE POLICY "Authenticated users can insert critical moments"
ON public.call_critical_moments
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Secure critical_moment_notifications
DROP POLICY IF EXISTS "cmn_system_insert" ON public.critical_moment_notifications;
CREATE POLICY "Users can view own critical moment notifications"
ON public.critical_moment_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = recipient_user_id);

CREATE POLICY "Authenticated users can insert critical moment notifications"
ON public.critical_moment_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
