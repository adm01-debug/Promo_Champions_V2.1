-- Add time limit fields to cadence_alert_templates
ALTER TABLE public.cadence_alert_templates 
ADD COLUMN IF NOT EXISTS start_time TIME DEFAULT '09:00:00',
ADD COLUMN IF NOT EXISTS end_time TIME DEFAULT '18:00:00',
ADD COLUMN IF NOT EXISTS days_of_week TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

-- Add multi-channel alert support to outcome rules
ALTER TABLE public.cadence_outcome_rules
ADD COLUMN IF NOT EXISTS push_template_id UUID REFERENCES public.cadence_alert_templates(id),
ADD COLUMN IF NOT EXISTS email_template_id UUID REFERENCES public.cadence_alert_templates(id);

-- Add tracking for applied rules in logs
ALTER TABLE public.intent_audit_logs
ADD COLUMN IF NOT EXISTS rule_applied JSONB;
