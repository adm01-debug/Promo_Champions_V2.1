-- forecast_snapshots
CREATE TABLE public.forecast_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  owner_id uuid,
  segment text,
  forecast_amount numeric NOT NULL DEFAULT 0,
  forecast_deals int NOT NULL DEFAULT 0,
  weighted_amount numeric NOT NULL DEFAULT 0,
  commit_amount numeric NOT NULL DEFAULT 0,
  best_case_amount numeric NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'weighted' CHECK (source IN ('manual','weighted','ai')),
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_forecast_snapshots_period ON public.forecast_snapshots(period_start, period_end);
CREATE INDEX idx_forecast_snapshots_owner ON public.forecast_snapshots(owner_id);
CREATE INDEX idx_forecast_snapshots_source ON public.forecast_snapshots(source);

ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fs_read_auth" ON public.forecast_snapshots
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "fs_write_admin_manager" ON public.forecast_snapshots
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- forecast_accuracy
CREATE TABLE public.forecast_accuracy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id uuid NOT NULL UNIQUE REFERENCES public.forecast_snapshots(id) ON DELETE CASCADE,
  actual_amount numeric NOT NULL DEFAULT 0,
  actual_deals int NOT NULL DEFAULT 0,
  variance_amount numeric GENERATED ALWAYS AS (actual_amount - 0) STORED,
  variance_pct numeric NOT NULL DEFAULT 0,
  mape numeric NOT NULL DEFAULT 0,
  bias text NOT NULL DEFAULT 'accurate' CHECK (bias IN ('optimistic','pessimistic','accurate')),
  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_forecast_accuracy_bias ON public.forecast_accuracy(bias);

ALTER TABLE public.forecast_accuracy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fa_read_auth" ON public.forecast_accuracy
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "fa_write_admin_manager" ON public.forecast_accuracy
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- forecast_confidence_scores
CREATE TABLE public.forecast_confidence_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  source text NOT NULL,
  period_count int NOT NULL DEFAULT 0,
  avg_mape numeric NOT NULL DEFAULT 0,
  bias_trend text NOT NULL DEFAULT 'accurate',
  confidence_score numeric NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, source)
);

CREATE INDEX idx_fcs_owner ON public.forecast_confidence_scores(owner_id);
CREATE INDEX idx_fcs_source ON public.forecast_confidence_scores(source);

ALTER TABLE public.forecast_confidence_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fcs_read_auth" ON public.forecast_confidence_scores
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "fcs_write_admin_manager" ON public.forecast_confidence_scores
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.forecast_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forecast_accuracy;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forecast_confidence_scores;