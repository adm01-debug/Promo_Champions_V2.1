-- Tabela de regras de auto-enrollment
CREATE TABLE public.cadence_enrollment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cadence_id UUID NOT NULL REFERENCES public.cadences(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 100,
  -- Critérios
  trigger_stage TEXT,
  trigger_category TEXT,
  trigger_source TEXT,
  min_amount NUMERIC(12,2),
  max_amount NUMERIC(12,2),
  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_enrollment_rules_active ON public.cadence_enrollment_rules(is_active, priority) WHERE is_active = true;
CREATE INDEX idx_enrollment_rules_cadence ON public.cadence_enrollment_rules(cadence_id);

ALTER TABLE public.cadence_enrollment_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view enrollment rules"
  ON public.cadence_enrollment_rules FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins/managers can manage enrollment rules"
  ON public.cadence_enrollment_rules FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER update_enrollment_rules_updated_at
  BEFORE UPDATE ON public.cadence_enrollment_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Rastrear via qual regra um prospect foi inscrito
ALTER TABLE public.prospect_cadences
  ADD COLUMN IF NOT EXISTS enrolled_via_rule_id UUID REFERENCES public.cadence_enrollment_rules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS enrollment_source TEXT NOT NULL DEFAULT 'manual';

-- RPC: avalia regras e retorna a cadência mais adequada para um sale
CREATE OR REPLACE FUNCTION public.find_matching_cadence_rule(_sale_id UUID)
RETURNS TABLE(rule_id UUID, cadence_id UUID, rule_name TEXT)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sale RECORD;
BEGIN
  SELECT s.id, s.stage, s.category, s.source, s.amount
  INTO _sale
  FROM public.sales s
  WHERE s.id = _sale_id;

  IF _sale.id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT r.id, r.cadence_id, r.name
  FROM public.cadence_enrollment_rules r
  WHERE r.is_active = true
    AND (r.trigger_stage IS NULL OR r.trigger_stage = _sale.stage)
    AND (r.trigger_category IS NULL OR r.trigger_category = _sale.category)
    AND (r.trigger_source IS NULL OR r.trigger_source = _sale.source)
    AND (r.min_amount IS NULL OR _sale.amount >= r.min_amount)
    AND (r.max_amount IS NULL OR _sale.amount <= r.max_amount)
    -- Não re-inscrever se já existe cadência ativa com a mesma cadence_id
    AND NOT EXISTS (
      SELECT 1 FROM public.prospect_cadences pc
      WHERE pc.sale_id = _sale_id
        AND pc.cadence_id = r.cadence_id
        AND pc.status IN ('active', 'paused')
    )
  ORDER BY r.priority ASC
  LIMIT 1;
END;
$$;