-- 1. win_loss_analyses
CREATE TABLE public.win_loss_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL UNIQUE REFERENCES public.sales(id) ON DELETE CASCADE,
  outcome text NOT NULL CHECK (outcome IN ('won','lost')),
  primary_reason text,
  secondary_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  competitor text,
  lost_stage text,
  cycle_days numeric,
  amount numeric,
  segment text,
  analyzed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wla_outcome ON public.win_loss_analyses(outcome);
CREATE INDEX idx_wla_segment ON public.win_loss_analyses(segment);
CREATE INDEX idx_wla_competitor ON public.win_loss_analyses(competitor);
CREATE INDEX idx_wla_analyzed_at ON public.win_loss_analyses(analyzed_at DESC);

ALTER TABLE public.win_loss_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wla read auth" ON public.win_loss_analyses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "wla write admin/manager" ON public.win_loss_analyses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- 2. win_loss_patterns
CREATE TABLE public.win_loss_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type text NOT NULL CHECK (pattern_type IN ('win_factor','loss_factor','stuck_stage','competitor','icp_match')),
  label text NOT NULL,
  outcome text,
  frequency int NOT NULL DEFAULT 0,
  win_rate numeric NOT NULL DEFAULT 0,
  avg_cycle_days numeric NOT NULL DEFAULT 0,
  avg_amount numeric NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wlp_type ON public.win_loss_patterns(pattern_type);
CREATE INDEX idx_wlp_freq ON public.win_loss_patterns(frequency DESC);
CREATE UNIQUE INDEX uq_wlp_type_label ON public.win_loss_patterns(pattern_type, label);

ALTER TABLE public.win_loss_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wlp read auth" ON public.win_loss_patterns
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "wlp write admin/manager" ON public.win_loss_patterns
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- 3. win_loss_insights
CREATE TABLE public.win_loss_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','opportunity','risk')),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_wli_severity ON public.win_loss_insights(severity);
CREATE INDEX idx_wli_created ON public.win_loss_insights(created_at DESC);

ALTER TABLE public.win_loss_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wli read auth" ON public.win_loss_insights
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "wli write admin/manager" ON public.win_loss_insights
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.win_loss_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.win_loss_patterns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.win_loss_insights;