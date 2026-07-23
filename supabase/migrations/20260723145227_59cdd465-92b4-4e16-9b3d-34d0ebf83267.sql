
-- Configurable inactivity thresholds per pipeline stage
CREATE TABLE public.stage_inactivity_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  mild_days INTEGER NOT NULL CHECK (mild_days > 0),
  moderate_days INTEGER NOT NULL CHECK (moderate_days > mild_days),
  critical_days INTEGER NOT NULL CHECK (critical_days > moderate_days),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.stage_inactivity_rules TO authenticated;
GRANT ALL ON public.stage_inactivity_rules TO service_role;

ALTER TABLE public.stage_inactivity_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read stage inactivity rules"
  ON public.stage_inactivity_rules FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Only admins can manage stage inactivity rules"
  ON public.stage_inactivity_rules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_stage_inactivity_rules_updated
  BEFORE UPDATE ON public.stage_inactivity_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.stage_inactivity_rules (stage, label, mild_days, moderate_days, critical_days) VALUES
  ('lead',        'Lead',        2, 3, 4),
  ('qualified',   'Qualificado', 3, 5, 6),
  ('proposal',    'Proposta',    5, 8, 10),
  ('negotiation', 'Negociação',  7, 11, 14),
  ('won',         'Ganho',       15, 23, 30),
  ('lost',        'Perdido',     30, 45, 60);
