
CREATE TABLE IF NOT EXISTS public.deal_velocity_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE CASCADE,
  owner_id UUID,
  predicted_close_date DATE,
  predicted_days_remaining INT,
  confidence_score INT NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  confidence_tier TEXT NOT NULL DEFAULT 'low' CHECK (confidence_tier IN ('low','medium','high')),
  velocity_status TEXT NOT NULL DEFAULT 'on_track' CHECK (velocity_status IN ('ahead','on_track','slow','stalled')),
  current_stage TEXT,
  days_in_stage INT,
  expected_days_in_stage NUMERIC,
  stage_velocity_ratio NUMERIC,
  factors JSONB NOT NULL DEFAULT '{"drivers":[],"brakes":[]}'::jsonb,
  model_version TEXT NOT NULL DEFAULT 'v1',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dvp_owner_status ON public.deal_velocity_predictions(owner_id, velocity_status);
CREATE INDEX IF NOT EXISTS idx_dvp_calculated_at ON public.deal_velocity_predictions(calculated_at DESC);

ALTER TABLE public.deal_velocity_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dvp_select_own_or_admin"
  ON public.deal_velocity_predictions FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
    OR EXISTS (
      SELECT 1 FROM public.sales s
      JOIN public.salespeople sp ON sp.id = s.salesperson_id
      WHERE s.id = deal_velocity_predictions.sale_id AND sp.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "dvp_admin_write"
  ON public.deal_velocity_predictions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_dvp_updated_at
  BEFORE UPDATE ON public.deal_velocity_predictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.stage_velocity_baselines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL,
  owner_id UUID,
  avg_days NUMERIC NOT NULL DEFAULT 0,
  median_days NUMERIC NOT NULL DEFAULT 0,
  p75_days NUMERIC NOT NULL DEFAULT 0,
  sample_size INT NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_svb_stage_owner
  ON public.stage_velocity_baselines(stage, COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid));

ALTER TABLE public.stage_velocity_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "svb_select_authenticated"
  ON public.stage_velocity_baselines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "svb_admin_write"
  ON public.stage_velocity_baselines FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_svb_updated_at
  BEFORE UPDATE ON public.stage_velocity_baselines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.deal_velocity_predictions REPLICA IDENTITY FULL;
ALTER TABLE public.stage_velocity_baselines REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deal_velocity_predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stage_velocity_baselines;
