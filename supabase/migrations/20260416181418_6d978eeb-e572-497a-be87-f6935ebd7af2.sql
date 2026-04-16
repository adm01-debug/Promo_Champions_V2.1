
CREATE TABLE public.sla_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL UNIQUE,
  max_hours INTEGER NOT NULL DEFAULT 72,
  warning_hours INTEGER NOT NULL DEFAULT 48,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view SLA policies" ON public.sla_policies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/manager can manage SLA policies" ON public.sla_policies
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE TABLE public.sla_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES public.sla_policies(id) ON DELETE SET NULL,
  stage TEXT NOT NULL,
  hours_in_stage NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'warning',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salespeople view own violations" ON public.sla_violations
  FOR SELECT TO authenticated
  USING (
    public.is_admin_or_manager(auth.uid())
    OR EXISTS (SELECT 1 FROM public.sales s WHERE s.id = sla_violations.sale_id AND s.salesperson_id = public.get_current_salesperson_id())
  );
CREATE POLICY "Admin/manager manage violations" ON public.sla_violations
  FOR ALL TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE INDEX idx_sla_violations_sale_id ON public.sla_violations(sale_id);
CREATE INDEX idx_sla_violations_status ON public.sla_violations(status);
CREATE INDEX idx_sla_violations_detected ON public.sla_violations(detected_at DESC);

CREATE TRIGGER trg_sla_policies_updated BEFORE UPDATE ON public.sla_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sla_violations_updated BEFORE UPDATE ON public.sla_violations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.sla_policies (stage, max_hours, warning_hours, description) VALUES
  ('lead', 72, 48, 'Lead novo deve ser contatado em até 3 dias'),
  ('prospecting', 120, 96, 'Prospecção deve avançar em até 5 dias'),
  ('qualified', 168, 120, 'Qualificado deve receber proposta em 1 semana'),
  ('proposal', 120, 72, 'Proposta deve ser respondida em 5 dias'),
  ('negotiation', 168, 120, 'Negociação não deve passar de 1 semana')
ON CONFLICT (stage) DO NOTHING;

CREATE OR REPLACE FUNCTION public.check_sla_violations()
RETURNS TABLE(processed INTEGER, new_warnings INTEGER, new_violations INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row RECORD;
  _hours NUMERIC;
  _new_status TEXT;
  _processed INT := 0;
  _warnings INT := 0;
  _violations INT := 0;
BEGIN
  FOR _row IN
    SELECT s.id AS sale_id, s.stage, s.updated_at, p.id AS policy_id, p.max_hours, p.warning_hours
    FROM public.sales s
    JOIN public.sla_policies p ON p.stage = s.stage AND p.is_active = true
    WHERE s.status NOT IN ('completed', 'lost', 'cancelled')
  LOOP
    _processed := _processed + 1;
    _hours := EXTRACT(EPOCH FROM (now() - _row.updated_at)) / 3600.0;
    
    IF _hours >= _row.max_hours THEN
      _new_status := 'violated';
    ELSIF _hours >= _row.warning_hours THEN
      _new_status := 'warning';
    ELSE
      CONTINUE;
    END IF;

    INSERT INTO public.sla_violations (sale_id, policy_id, stage, hours_in_stage, status)
    VALUES (_row.sale_id, _row.policy_id, _row.stage, _hours, _new_status)
    ON CONFLICT DO NOTHING;

    IF _new_status = 'warning' THEN _warnings := _warnings + 1;
    ELSE _violations := _violations + 1; END IF;
  END LOOP;

  RETURN QUERY SELECT _processed, _warnings, _violations;
END;
$$;
