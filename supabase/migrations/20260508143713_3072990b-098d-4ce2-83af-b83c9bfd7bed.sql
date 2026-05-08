-- Add timezone support to cadence alert templates
ALTER TABLE public.cadence_alert_templates 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo';

-- Add timezone to outcome rules for retry logic
ALTER TABLE public.cadence_outcome_rules
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo';

-- Optimize intent audit logs
CREATE INDEX IF NOT EXISTS idx_intent_audit_logs_lead_id ON public.intent_audit_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_cadence_outcome_rules_outcome ON public.cadence_outcome_rules(outcome);

-- Ensure intent_audit_logs has enough details for audit
COMMENT ON COLUMN public.intent_audit_logs.rule_applied IS 'JSON containing the rule that triggered this log entry';
