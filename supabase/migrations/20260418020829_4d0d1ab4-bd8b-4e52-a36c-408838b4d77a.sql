
-- 1) stage_conversion_metrics
CREATE TABLE public.stage_conversion_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  owner_id UUID NULL,
  entered_count INT NOT NULL DEFAULT 0,
  converted_count INT NOT NULL DEFAULT 0,
  lost_count INT NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_transition_days NUMERIC(8,2) NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX stage_conversion_metrics_unique
  ON public.stage_conversion_metrics (from_stage, to_stage, COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid), period_start);

CREATE INDEX idx_stage_conversion_owner ON public.stage_conversion_metrics (owner_id);
CREATE INDEX idx_stage_conversion_from ON public.stage_conversion_metrics (from_stage);

ALTER TABLE public.stage_conversion_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own and global conversion metrics"
ON public.stage_conversion_metrics FOR SELECT
USING (
  owner_id IS NULL
  OR owner_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Service role manages conversion metrics insert"
ON public.stage_conversion_metrics FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Service role manages conversion metrics update"
ON public.stage_conversion_metrics FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TRIGGER update_stage_conversion_metrics_updated_at
BEFORE UPDATE ON public.stage_conversion_metrics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.stage_conversion_metrics;
ALTER TABLE public.stage_conversion_metrics REPLICA IDENTITY FULL;


-- 2) stage_bottleneck_insights
CREATE TABLE public.stage_bottleneck_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage TEXT NOT NULL,
  owner_id UUID NULL,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  conversion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  top_loss_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_summary TEXT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX stage_bottleneck_insights_unique
  ON public.stage_bottleneck_insights (stage, COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX idx_stage_bottleneck_owner ON public.stage_bottleneck_insights (owner_id);
CREATE INDEX idx_stage_bottleneck_severity ON public.stage_bottleneck_insights (severity);

ALTER TABLE public.stage_bottleneck_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own and global bottleneck insights"
ON public.stage_bottleneck_insights FOR SELECT
USING (
  owner_id IS NULL
  OR owner_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins manage bottleneck insights insert"
ON public.stage_bottleneck_insights FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins manage bottleneck insights update"
ON public.stage_bottleneck_insights FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TRIGGER update_stage_bottleneck_insights_updated_at
BEFORE UPDATE ON public.stage_bottleneck_insights
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.stage_bottleneck_insights;
ALTER TABLE public.stage_bottleneck_insights REPLICA IDENTITY FULL;
