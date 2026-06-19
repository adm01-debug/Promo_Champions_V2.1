CREATE TABLE IF NOT EXISTS public.web_vitals_samples (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('LCP','INP','CLS','FCP','TTFB')),
  value DOUBLE PRECISION NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good','needs-improvement','poor')),
  navigation_type TEXT,
  user_id UUID,
  session_id TEXT,
  user_agent TEXT,
  viewport_width INTEGER,
  connection_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_web_vitals_route_metric_created
  ON public.web_vitals_samples (route, metric, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at
  ON public.web_vitals_samples (created_at DESC);

GRANT SELECT ON public.web_vitals_samples TO authenticated;
GRANT ALL ON public.web_vitals_samples TO service_role;

ALTER TABLE public.web_vitals_samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read web vitals"
  ON public.web_vitals_samples
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Aggregated view (p75 per route/metric, last 7 days)
CREATE OR REPLACE VIEW public.web_vitals_p75_last7d
WITH (security_invoker = true)
AS
SELECT
  route,
  metric,
  COUNT(*) AS samples,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY value) AS p95,
  AVG(value) AS avg_value,
  SUM(CASE WHEN rating = 'poor' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*),0) AS poor_ratio
FROM public.web_vitals_samples
WHERE created_at > now() - interval '7 days'
GROUP BY route, metric;

GRANT SELECT ON public.web_vitals_p75_last7d TO authenticated;