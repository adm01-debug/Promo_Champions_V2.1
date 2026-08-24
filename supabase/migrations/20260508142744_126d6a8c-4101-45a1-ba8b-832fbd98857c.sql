-- Create table for alert templates
CREATE TABLE IF NOT EXISTS public.cadence_alert_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('push', 'email')),
  subject TEXT, -- only for email
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for outcome rules
CREATE TABLE IF NOT EXISTS public.cadence_outcome_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome TEXT NOT NULL, -- e.g., 'atendeu', 'nao_atendeu', 'interessado', 'agendado'
  to_stage TEXT NOT NULL, -- e.g., 'high_interest', 'scheduled'
  next_action TEXT, -- e.g., 'pause', 'retry', 'next_step'
  retry_delay_hours INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 1,
  fallback_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cadence_alert_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_outcome_rules ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Public read for alert templates" ON public.cadence_alert_templates FOR SELECT USING (true);
CREATE POLICY "Public write for alert templates" ON public.cadence_alert_templates FOR ALL USING (true); -- Simplifying for dev, usually auth.uid()
CREATE POLICY "Public read for outcome rules" ON public.cadence_outcome_rules FOR SELECT USING (true);
CREATE POLICY "Public write for outcome rules" ON public.cadence_outcome_rules FOR ALL USING (true);

-- Add initial sample alert templates
INSERT INTO public.cadence_alert_templates (name, type, subject, content, is_default)
VALUES 
('Alerta de Lead Quente', 'push', NULL, 'Lead {{singu_lead_name}} atingiu o gatilho {{trigger_name}}! Ligue agora.', true),
('Notificação de Interesse Alto', 'email', 'Lead Quente: {{singu_lead_name}}', 'O lead {{singu_lead_name}} na etapa {{funnel_stage}} demonstrou alto interesse via {{trigger_name}}. Verifique o CRM.', true);

-- Add initial outcome rules
INSERT INTO public.cadence_outcome_rules (outcome, to_stage, next_action, retry_delay_hours, max_retries)
VALUES 
('atendeu', 'high_interest', 'next_step', 0, 1),
('nao_atendeu', 'new', 'retry', 4, 3),
('interessado', 'high_interest', 'next_step', 0, 1),
('agendado', 'scheduled', 'pause', 0, 1);