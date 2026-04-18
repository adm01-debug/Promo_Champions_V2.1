-- Pipeline Coverage Snapshots
CREATE TABLE public.pipeline_coverage_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  owner_id UUID NULL,
  segment TEXT NULL,
  stage TEXT NULL,
  quota_amount NUMERIC NOT NULL DEFAULT 0,
  pipeline_amount NUMERIC NOT NULL DEFAULT 0,
  weighted_pipeline NUMERIC NOT NULL DEFAULT 0,
  coverage_ratio NUMERIC NOT NULL DEFAULT 0,
  target_ratio NUMERIC NOT NULL DEFAULT 3.0,
  health TEXT NOT NULL DEFAULT 'critical' CHECK (health IN ('critical','weak','healthy','strong')),
  gap_to_target NUMERIC NOT NULL DEFAULT 0,
  deals_count INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pcs_period_owner_stage ON public.pipeline_coverage_snapshots (period_start, owner_id, stage);
CREATE INDEX idx_pcs_calculated_at ON public.pipeline_coverage_snapshots (calculated_at DESC);
CREATE INDEX idx_pcs_health ON public.pipeline_coverage_snapshots (health);

ALTER TABLE public.pipeline_coverage_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view coverage snapshots"
  ON public.pipeline_coverage_snapshots FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins/managers can insert coverage snapshots"
  ON public.pipeline_coverage_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admins/managers can update coverage snapshots"
  ON public.pipeline_coverage_snapshots FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Admins can delete coverage snapshots"
  ON public.pipeline_coverage_snapshots FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Recommendations
CREATE TABLE public.pipeline_coverage_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  snapshot_id UUID NOT NULL REFERENCES public.pipeline_coverage_snapshots(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  title TEXT NOT NULL,
  action TEXT NOT NULL,
  expected_impact_amount NUMERIC NOT NULL DEFAULT 0,
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  acted_on BOOLEAN NOT NULL DEFAULT false,
  acted_on_at TIMESTAMPTZ NULL,
  acted_on_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pcr_snapshot ON public.pipeline_coverage_recommendations (snapshot_id);
CREATE INDEX idx_pcr_priority ON public.pipeline_coverage_recommendations (priority, acted_on);

ALTER TABLE public.pipeline_coverage_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view coverage recommendations"
  ON public.pipeline_coverage_recommendations FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins/managers can insert coverage recommendations"
  ON public.pipeline_coverage_recommendations FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Authenticated users can update coverage recommendations"
  ON public.pipeline_coverage_recommendations FOR UPDATE
  TO authenticated USING (true);

CREATE POLICY "Admins can delete coverage recommendations"
  ON public.pipeline_coverage_recommendations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Summary view (latest snapshot per owner / global)
CREATE OR REPLACE VIEW public.v_pipeline_coverage_summary AS
SELECT DISTINCT ON (COALESCE(owner_id::text, 'global'))
  COALESCE(owner_id::text, 'global') AS owner_key,
  owner_id,
  period_start,
  period_end,
  SUM(quota_amount) OVER (PARTITION BY COALESCE(owner_id::text,'global'), calculated_at) AS total_quota,
  SUM(weighted_pipeline) OVER (PARTITION BY COALESCE(owner_id::text,'global'), calculated_at) AS total_weighted,
  AVG(coverage_ratio) OVER (PARTITION BY COALESCE(owner_id::text,'global'), calculated_at) AS avg_ratio,
  health,
  calculated_at
FROM public.pipeline_coverage_snapshots
ORDER BY COALESCE(owner_id::text,'global'), calculated_at DESC;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_coverage_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_coverage_recommendations;