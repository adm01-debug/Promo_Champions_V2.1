-- Quota Attainment Forecasts (Monte Carlo advanced)
CREATE TABLE public.quota_attainment_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  quota NUMERIC NOT NULL DEFAULT 0,
  closed NUMERIC NOT NULL DEFAULT 0,
  weighted_open NUMERIC NOT NULL DEFAULT 0,
  pace_per_day NUMERIC NOT NULL DEFAULT 0,
  days_remaining INT NOT NULL DEFAULT 0,
  p10 NUMERIC NOT NULL DEFAULT 0,
  p50 NUMERIC NOT NULL DEFAULT 0,
  p90 NUMERIC NOT NULL DEFAULT 0,
  attainment_probability NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'on_track' CHECK (risk_level IN ('safe','on_track','at_risk','critical')),
  simulations INT NOT NULL DEFAULT 1000,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT quota_forecasts_unique_period UNIQUE (salesperson_id, period_start)
);

CREATE INDEX idx_quota_forecasts_salesperson ON public.quota_attainment_forecasts(salesperson_id);
CREATE INDEX idx_quota_forecasts_risk ON public.quota_attainment_forecasts(risk_level);
CREATE INDEX idx_quota_forecasts_computed ON public.quota_attainment_forecasts(computed_at DESC);

ALTER TABLE public.quota_attainment_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view quota forecasts"
  ON public.quota_attainment_forecasts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins/managers manage quota forecasts"
  ON public.quota_attainment_forecasts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.quota_attainment_forecasts;

-- Quota Attainment Actions (AI recommendations)
CREATE TABLE public.quota_attainment_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forecast_id UUID NOT NULL REFERENCES public.quota_attainment_forecasts(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('close_deal','generate_pipeline','increase_ticket','accelerate_stage')),
  title TEXT NOT NULL,
  description TEXT,
  expected_impact NUMERIC NOT NULL DEFAULT 0,
  priority INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quota_actions_forecast ON public.quota_attainment_actions(forecast_id);
CREATE INDEX idx_quota_actions_priority ON public.quota_attainment_actions(priority);

ALTER TABLE public.quota_attainment_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view quota actions"
  ON public.quota_attainment_actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins/managers manage quota actions"
  ON public.quota_attainment_actions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.quota_attainment_actions;