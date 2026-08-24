
-- Win Probability Calibrations table
CREATE TABLE public.win_probability_calibrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('global','owner','segment','source')),
  scope_value text,
  stage text NOT NULL,
  historical_win_rate numeric NOT NULL DEFAULT 0,
  sample_size integer NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  calibrated_probability numeric NOT NULL DEFAULT 0,
  baseline_probability numeric NOT NULL DEFAULT 0,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, scope_value, stage)
);

CREATE INDEX idx_wpc_scope_stage ON public.win_probability_calibrations (scope, scope_value, stage);
CREATE INDEX idx_wpc_calculated_at ON public.win_probability_calibrations (calculated_at DESC);

ALTER TABLE public.win_probability_calibrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read calibrations"
  ON public.win_probability_calibrations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admin/manager write calibrations"
  ON public.win_probability_calibrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.win_probability_calibrations;

-- Deal Probability Scores table
CREATE TABLE public.deal_probability_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  raw_probability numeric NOT NULL DEFAULT 0,
  calibrated_probability numeric NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dps_sale_calculated ON public.deal_probability_scores (sale_id, calculated_at DESC);
CREATE INDEX idx_dps_calculated_at ON public.deal_probability_scores (calculated_at DESC);

ALTER TABLE public.deal_probability_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read deal scores"
  ON public.deal_probability_scores FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admin/manager write deal scores"
  ON public.deal_probability_scores FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_probability_scores;
