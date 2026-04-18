-- Conversation Intelligence 1/4: Talk Ratio & Pace Analyzer
CREATE TABLE IF NOT EXISTS public.call_conversation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL UNIQUE REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  seller_talk_ratio numeric NOT NULL DEFAULT 0,
  client_talk_ratio numeric NOT NULL DEFAULT 0,
  silence_ratio numeric NOT NULL DEFAULT 0,
  longest_monologue_seconds integer NOT NULL DEFAULT 0,
  interruptions_count integer NOT NULL DEFAULT 0,
  seller_words_per_minute integer NOT NULL DEFAULT 0,
  client_words_per_minute integer NOT NULL DEFAULT 0,
  pace_score numeric NOT NULL DEFAULT 0,
  engagement_score numeric NOT NULL DEFAULT 0,
  health text NOT NULL DEFAULT 'fair' CHECK (health IN ('poor','fair','good','excellent')),
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ccm_recording ON public.call_conversation_metrics(recording_id);
CREATE INDEX IF NOT EXISTS idx_ccm_health_calc ON public.call_conversation_metrics(health, calculated_at DESC);

ALTER TABLE public.call_conversation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ccm_select_authenticated" ON public.call_conversation_metrics
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "ccm_write_admin_manager" ON public.call_conversation_metrics
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE TABLE IF NOT EXISTS public.call_metric_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric text NOT NULL UNIQUE,
  p25 numeric NOT NULL DEFAULT 0,
  p50 numeric NOT NULL DEFAULT 0,
  p75 numeric NOT NULL DEFAULT 0,
  target_min numeric NOT NULL DEFAULT 0,
  target_max numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.call_metric_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cmb_select_authenticated" ON public.call_metric_benchmarks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cmb_write_admin" ON public.call_metric_benchmarks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.call_metric_benchmarks (metric, p25, p50, p75, target_min, target_max) VALUES
  ('seller_talk_ratio', 0.35, 0.50, 0.65, 0.40, 0.60),
  ('silence_ratio', 0.05, 0.10, 0.20, 0.00, 0.15),
  ('seller_wpm', 110, 140, 170, 130, 160),
  ('interruptions', 0, 2, 5, 0, 3),
  ('longest_monologue_seconds', 30, 60, 120, 0, 90)
ON CONFLICT (metric) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.call_conversation_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_metric_benchmarks;