-- ──────────────────────────────────────────────
-- Templates por estágio do pipeline
-- ──────────────────────────────────────────────
ALTER TABLE public.message_templates
  ADD COLUMN IF NOT EXISTS pipeline_stage TEXT,
  ADD COLUMN IF NOT EXISTS usage_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_message_templates_stage
  ON public.message_templates(pipeline_stage)
  WHERE pipeline_stage IS NOT NULL;

-- ──────────────────────────────────────────────
-- A/B Testing de Cadências
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cadence_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  variant_a_id UUID NOT NULL REFERENCES public.cadences(id) ON DELETE CASCADE,
  variant_b_id UUID NOT NULL REFERENCES public.cadences(id) ON DELETE CASCADE,
  traffic_split INTEGER NOT NULL DEFAULT 50, -- % para variante A (resto vai pra B)
  status TEXT NOT NULL DEFAULT 'draft', -- draft | running | paused | completed
  hypothesis TEXT,
  winner_variant TEXT, -- 'a' | 'b' | null
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_split_range CHECK (traffic_split BETWEEN 1 AND 99),
  CONSTRAINT chk_distinct_variants CHECK (variant_a_id <> variant_b_id)
);

CREATE TABLE IF NOT EXISTS public.cadence_ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id UUID NOT NULL REFERENCES public.cadence_ab_tests(id) ON DELETE CASCADE,
  prospect_cadence_id UUID NOT NULL REFERENCES public.prospect_cadences(id) ON DELETE CASCADE,
  variant TEXT NOT NULL CHECK (variant IN ('a','b')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(ab_test_id, prospect_cadence_id)
);

CREATE INDEX IF NOT EXISTS idx_ab_assignments_test ON public.cadence_ab_assignments(ab_test_id, variant);

ALTER TABLE public.cadence_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_ab_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view ab tests"
  ON public.cadence_ab_tests FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins/managers manage ab tests"
  ON public.cadence_ab_tests FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Authenticated can view ab assignments"
  ON public.cadence_ab_assignments FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins/managers manage ab assignments"
  ON public.cadence_ab_assignments FOR ALL
  TO authenticated
  USING (public.is_admin_or_manager(auth.uid()))
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.cadence_ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: distribui variante respeitando split
CREATE OR REPLACE FUNCTION public.assign_cadence_variant(_ab_test_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _split INT;
  _count_a INT;
  _count_b INT;
  _total INT;
  _ratio_a NUMERIC;
BEGIN
  SELECT traffic_split INTO _split FROM public.cadence_ab_tests WHERE id = _ab_test_id;
  IF _split IS NULL THEN RETURN 'a'; END IF;

  SELECT
    COUNT(*) FILTER (WHERE variant = 'a'),
    COUNT(*) FILTER (WHERE variant = 'b')
  INTO _count_a, _count_b
  FROM public.cadence_ab_assignments
  WHERE ab_test_id = _ab_test_id;

  _total := _count_a + _count_b;
  IF _total = 0 THEN RETURN 'a'; END IF;

  _ratio_a := (_count_a::NUMERIC / _total::NUMERIC) * 100;

  IF _ratio_a < _split THEN
    RETURN 'a';
  ELSE
    RETURN 'b';
  END IF;
END;
$$;

-- RPC: resultados do teste
CREATE OR REPLACE FUNCTION public.get_ab_test_results(_ab_test_id UUID)
RETURNS TABLE(
  variant TEXT,
  cadence_name TEXT,
  enrolled INT,
  completed INT,
  replied INT,
  converted INT,
  reply_rate NUMERIC,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH test AS (
    SELECT id, variant_a_id, variant_b_id FROM public.cadence_ab_tests WHERE id = _ab_test_id
  ),
  base AS (
    SELECT 'a'::TEXT AS variant, (SELECT variant_a_id FROM test) AS cad_id
    UNION ALL
    SELECT 'b'::TEXT AS variant, (SELECT variant_b_id FROM test) AS cad_id
  ),
  stats AS (
    SELECT
      a.variant,
      COUNT(DISTINCT pc.id)::INT AS enrolled,
      COUNT(DISTINCT pc.id) FILTER (WHERE pc.status = 'completed')::INT AS completed,
      COUNT(DISTINCT ci.deal_id)::INT AS replied,
      COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed')::INT AS converted
    FROM public.cadence_ab_assignments a
    JOIN public.prospect_cadences pc ON pc.id = a.prospect_cadence_id
    LEFT JOIN public.channel_interactions ci ON ci.deal_id = pc.sale_id AND ci.direction = 'inbound' AND ci.created_at >= pc.started_at
    LEFT JOIN public.sales s ON s.id = pc.sale_id
    WHERE a.ab_test_id = _ab_test_id
    GROUP BY a.variant
  )
  SELECT
    b.variant,
    c.name,
    COALESCE(s.enrolled, 0),
    COALESCE(s.completed, 0),
    COALESCE(s.replied, 0),
    COALESCE(s.converted, 0),
    CASE WHEN COALESCE(s.enrolled, 0) > 0
      THEN ROUND((COALESCE(s.replied, 0)::NUMERIC / s.enrolled::NUMERIC) * 100, 1)
      ELSE 0 END,
    CASE WHEN COALESCE(s.enrolled, 0) > 0
      THEN ROUND((COALESCE(s.converted, 0)::NUMERIC / s.enrolled::NUMERIC) * 100, 1)
      ELSE 0 END
  FROM base b
  LEFT JOIN public.cadences c ON c.id = b.cad_id
  LEFT JOIN stats s ON s.variant = b.variant
  ORDER BY b.variant;
END;
$$;