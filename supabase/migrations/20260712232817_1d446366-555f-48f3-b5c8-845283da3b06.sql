CREATE TABLE IF NOT EXISTS public.forecast_narrative_dead_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id uuid,
  user_id uuid,
  reason text NOT NULL,
  http_status int,
  error_detail text,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.forecast_narrative_dead_letters TO authenticated;
GRANT ALL ON public.forecast_narrative_dead_letters TO service_role;
ALTER TABLE public.forecast_narrative_dead_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read forecast narrative dlq" ON public.forecast_narrative_dead_letters
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS idx_fnd_dlq_created ON public.forecast_narrative_dead_letters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fnd_dlq_reason ON public.forecast_narrative_dead_letters(reason, created_at DESC);