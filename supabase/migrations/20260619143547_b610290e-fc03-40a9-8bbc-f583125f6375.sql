-- Melhoria #2: remover policies redundantes/abertas em tabelas internas
DROP POLICY IF EXISTS "System inserts runs" ON public.automation_runs;
DROP POLICY IF EXISTS "Service role can insert sync logs" ON public.bitrix24_sync_logs;
DROP POLICY IF EXISTS "Service role manages alert templates" ON public.cadence_alert_templates;
DROP POLICY IF EXISTS "Service role manages outcome rules" ON public.cadence_outcome_rules;
DROP POLICY IF EXISTS "Service role can insert circuit_breaker_events" ON public.circuit_breaker_events;
DROP POLICY IF EXISTS "Service role can insert email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "Service can insert geo_access_logs" ON public.geo_access_logs;
DROP POLICY IF EXISTS "System can insert alerts" ON public.login_alerts;
DROP POLICY IF EXISTS "Service role can insert login_attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "System can insert MFA attempts" ON public.mfa_verification_attempts;
DROP POLICY IF EXISTS "service role manages scheduled_sends" ON public.scheduled_sends;
DROP POLICY IF EXISTS "Service role can insert sdr_alert_history" ON public.sdr_alert_history;
DROP POLICY IF EXISTS "Service role can insert alert history" ON public.security_alert_history;
DROP POLICY IF EXISTS "service role manages send_time_profiles" ON public.send_time_profiles;
DROP POLICY IF EXISTS "Service role inserts executions" ON public.sequence_step_executions;
DROP POLICY IF EXISTS "Service role can insert dispatch metrics" ON public.winloss_webhook_dispatch_metrics;