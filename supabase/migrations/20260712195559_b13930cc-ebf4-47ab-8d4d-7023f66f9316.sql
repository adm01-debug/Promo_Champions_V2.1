
-- 1) sdr_alert_history: remover política pública ampla
DROP POLICY IF EXISTS "Everyone can view alert history" ON public.sdr_alert_history;

-- 2) audit_logs: apertar WITH CHECK
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Users can insert own audit entries"
  ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = actor_id);

-- 3) account_plans: exigir ownership no INSERT
DROP POLICY IF EXISTS "Users can insert account plans" ON public.account_plans;
CREATE POLICY "Owners or admins can insert account plans"
  ON public.account_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (is_admin_or_manager(auth.uid()) OR created_by = auth.uid())
  );

-- 4) lead_detailed_logs: exigir vínculo com o cliente
DROP POLICY IF EXISTS "Users can insert own logs" ON public.lead_detailed_logs;
CREATE POLICY "Users can insert logs for their clients"
  ON public.lead_detailed_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND (
      is_admin_or_manager(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.clients c
        WHERE c.id = lead_detailed_logs.client_id
          AND c.user_id = auth.uid()
      )
    )
  );
