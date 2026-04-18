
CREATE TABLE public.quota_attainment_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  quota_amount NUMERIC NOT NULL DEFAULT 0,
  closed_amount NUMERIC NOT NULL DEFAULT 0,
  weighted_pipeline NUMERIC NOT NULL DEFAULT 0,
  predicted_amount NUMERIC NOT NULL DEFAULT 0,
  attainment_probability NUMERIC NOT NULL DEFAULT 0,
  scenario_pessimistic NUMERIC NOT NULL DEFAULT 0,
  scenario_realistic NUMERIC NOT NULL DEFAULT 0,
  scenario_optimistic NUMERIC NOT NULL DEFAULT 0,
  pace_required_per_day NUMERIC NOT NULL DEFAULT 0,
  current_pace_per_day NUMERIC NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'on_track' CHECK (risk_level IN ('safe','on_track','at_risk','critical')),
  factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qap_salesperson_period ON public.quota_attainment_predictions(salesperson_id, period_start DESC);
CREATE INDEX idx_qap_calculated ON public.quota_attainment_predictions(calculated_at DESC);

ALTER TABLE public.quota_attainment_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read predictions"
ON public.quota_attainment_predictions FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admin/manager write predictions"
ON public.quota_attainment_predictions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TABLE public.quota_attainment_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES public.quota_attainment_predictions(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  message TEXT NOT NULL,
  recommended_action TEXT,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_qaa_salesperson ON public.quota_attainment_alerts(salesperson_id, created_at DESC);
CREATE INDEX idx_qaa_unack ON public.quota_attainment_alerts(acknowledged, created_at DESC);

ALTER TABLE public.quota_attainment_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read alerts"
ON public.quota_attainment_alerts FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admin/manager write alerts"
ON public.quota_attainment_alerts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.quota_attainment_predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quota_attainment_alerts;
