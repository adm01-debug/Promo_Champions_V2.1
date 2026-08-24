-- Snapshots de saúde de deals
CREATE TABLE public.deal_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL CHECK (health_score BETWEEN 0 AND 100),
  health_label TEXT NOT NULL CHECK (health_label IN ('critical','at_risk','healthy','excellent')),
  positive_factors JSONB DEFAULT '[]'::jsonb,
  negative_factors JSONB DEFAULT '[]'::jsonb,
  ai_recommendation TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deal_health_sale ON public.deal_health_scores(sale_id, computed_at DESC);

ALTER TABLE public.deal_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View health via sale access"
  ON public.deal_health_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.sales s
    WHERE s.id = sale_id
      AND (s.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ));

CREATE POLICY "Authenticated insert health scores"
  ON public.deal_health_scores FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Sinais de risco
CREATE TABLE public.deal_risk_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('stagnation','no_contact','engagement_drop','price_resistance','competitor_mentioned','single_threaded','overdue_followup')),
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.salespeople(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_risk_signals_sale ON public.deal_risk_signals(sale_id, detected_at DESC);
CREATE INDEX idx_risk_signals_unresolved ON public.deal_risk_signals(severity, detected_at DESC) WHERE resolved_at IS NULL;

ALTER TABLE public.deal_risk_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View signals via sale access"
  ON public.deal_risk_signals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.sales s
    WHERE s.id = sale_id
      AND (s.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ));

CREATE POLICY "Authenticated insert signals"
  ON public.deal_risk_signals FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners resolve own signals"
  ON public.deal_risk_signals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.sales s
    WHERE s.id = sale_id
      AND (s.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ));

-- RPC: calcula health score determinístico baseado em sinais reais
CREATE OR REPLACE FUNCTION public.calculate_deal_health(_sale_id UUID)
RETURNS TABLE(
  health_score INTEGER,
  health_label TEXT,
  positive_factors JSONB,
  negative_factors JSONB
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sale RECORD;
  _last_activity TIMESTAMPTZ;
  _activity_count INTEGER;
  _days_in_stage INTEGER;
  _interaction_count INTEGER;
  _score INTEGER := 50;
  _pos JSONB := '[]'::jsonb;
  _neg JSONB := '[]'::jsonb;
  _label TEXT;
BEGIN
  SELECT * INTO _sale FROM public.sales WHERE id = _sale_id;
  IF _sale.id IS NULL THEN RETURN; END IF;

  SELECT MAX(created_at), COUNT(*) INTO _last_activity, _activity_count
  FROM public.activities WHERE sale_id = _sale_id;

  SELECT COUNT(*) INTO _interaction_count
  FROM public.channel_interactions WHERE deal_id = _sale_id AND created_at > now() - interval '14 days';

  _days_in_stage := EXTRACT(DAY FROM (now() - _sale.updated_at))::INT;

  -- Recência de atividades
  IF _last_activity IS NOT NULL AND _last_activity > now() - interval '3 days' THEN
    _score := _score + 15;
    _pos := _pos || jsonb_build_object('factor','recent_activity','impact',15,'label','Atividade recente nos últimos 3 dias');
  ELSIF _last_activity IS NULL OR _last_activity < now() - interval '14 days' THEN
    _score := _score - 20;
    _neg := _neg || jsonb_build_object('factor','no_recent_activity','impact',-20,'label','Sem atividades há mais de 14 dias');
  END IF;

  -- Volume de atividades
  IF _activity_count >= 5 THEN
    _score := _score + 10;
    _pos := _pos || jsonb_build_object('factor','high_activity','impact',10,'label',_activity_count || ' atividades registradas');
  END IF;

  -- Engajamento via canais
  IF _interaction_count >= 3 THEN
    _score := _score + 15;
    _pos := _pos || jsonb_build_object('factor','engaged','impact',15,'label',_interaction_count || ' interações nos últimos 14 dias');
  ELSIF _interaction_count = 0 THEN
    _score := _score - 15;
    _neg := _neg || jsonb_build_object('factor','no_engagement','impact',-15,'label','Nenhuma interação multicanal recente');
  END IF;

  -- Tempo no estágio
  IF _days_in_stage > 30 THEN
    _score := _score - 25;
    _neg := _neg || jsonb_build_object('factor','stagnation','impact',-25,'label',_days_in_stage || ' dias parado no mesmo estágio');
  ELSIF _days_in_stage <= 7 THEN
    _score := _score + 10;
    _pos := _pos || jsonb_build_object('factor','fast_progress','impact',10,'label','Avanço rápido no funil');
  END IF;

  -- Estágio avançado
  IF _sale.stage IN ('proposal','negotiation') THEN
    _score := _score + 5;
    _pos := _pos || jsonb_build_object('factor','advanced_stage','impact',5,'label','Deal em estágio avançado');
  END IF;

  -- Clamp 0-100
  _score := GREATEST(0, LEAST(100, _score));

  _label := CASE
    WHEN _score >= 80 THEN 'excellent'
    WHEN _score >= 60 THEN 'healthy'
    WHEN _score >= 40 THEN 'at_risk'
    ELSE 'critical'
  END;

  RETURN QUERY SELECT _score, _label, _pos, _neg;
END;
$$;

-- RPC: forecast ponderado por estágio
CREATE OR REPLACE FUNCTION public.get_revenue_forecast(_days INTEGER DEFAULT 90)
RETURNS TABLE(
  period TEXT,
  weighted_revenue NUMERIC,
  raw_pipeline NUMERIC,
  deal_count INTEGER,
  avg_health INTEGER
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH stage_weights AS (
    SELECT * FROM (VALUES
      ('lead', 0.05),
      ('prospecting', 0.15),
      ('qualified', 0.30),
      ('proposal', 0.55),
      ('negotiation', 0.75),
      ('closed', 0.95)
    ) AS t(stage, weight)
  ),
  windows AS (
    SELECT * FROM (VALUES ('30d', 30), ('60d', 60), ('90d', 90)) AS w(label, days)
    WHERE days <= _days
  ),
  deals AS (
    SELECT s.id, s.amount, s.stage, s.updated_at
    FROM public.sales s
    WHERE s.status NOT IN ('completed','lost','cancelled')
      AND (s.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ),
  latest_health AS (
    SELECT DISTINCT ON (sale_id) sale_id, health_score
    FROM public.deal_health_scores
    ORDER BY sale_id, computed_at DESC
  )
  SELECT
    w.label,
    COALESCE(SUM(d.amount * sw.weight), 0)::NUMERIC,
    COALESCE(SUM(d.amount), 0)::NUMERIC,
    COUNT(d.id)::INTEGER,
    COALESCE(AVG(lh.health_score)::INTEGER, 50)
  FROM windows w
  LEFT JOIN deals d ON d.updated_at >= now() - (w.days || ' days')::INTERVAL
  LEFT JOIN stage_weights sw ON sw.stage = d.stage
  LEFT JOIN latest_health lh ON lh.sale_id = d.id
  GROUP BY w.label, w.days
  ORDER BY w.days;
END;
$$;