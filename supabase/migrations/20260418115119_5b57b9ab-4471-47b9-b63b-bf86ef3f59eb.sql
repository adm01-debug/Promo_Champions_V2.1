
-- Call coaching scorecards (per recording)
CREATE TABLE public.call_coaching_scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL UNIQUE REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  salesperson_id uuid,
  overall_score numeric NOT NULL DEFAULT 0,
  talk_score numeric NOT NULL DEFAULT 0,
  question_score numeric NOT NULL DEFAULT 0,
  objection_score numeric NOT NULL DEFAULT 0,
  sentiment_score numeric NOT NULL DEFAULT 0,
  moments_score numeric NOT NULL DEFAULT 0,
  health text NOT NULL DEFAULT 'fair' CHECK (health IN ('poor','fair','good','excellent')),
  top_strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ccs_recording ON public.call_coaching_scorecards(recording_id);
CREATE INDEX idx_ccs_salesperson ON public.call_coaching_scorecards(salesperson_id, calculated_at DESC);

ALTER TABLE public.call_coaching_scorecards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ccs_read_authenticated" ON public.call_coaching_scorecards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ccs_write_admin_manager" ON public.call_coaching_scorecards
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.call_coaching_scorecards;
ALTER TABLE public.call_coaching_scorecards REPLICA IDENTITY FULL;

-- Salesperson coaching aggregates (rolling 30d)
CREATE TABLE public.salesperson_coaching_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id uuid NOT NULL UNIQUE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  calls_analyzed int NOT NULL DEFAULT 0,
  avg_overall numeric NOT NULL DEFAULT 0,
  avg_talk numeric NOT NULL DEFAULT 0,
  avg_questions numeric NOT NULL DEFAULT 0,
  avg_objections numeric NOT NULL DEFAULT 0,
  avg_sentiment numeric NOT NULL DEFAULT 0,
  trend_direction text NOT NULL DEFAULT 'flat' CHECK (trend_direction IN ('up','flat','down')),
  trend_delta numeric NOT NULL DEFAULT 0,
  top_recurring_gap text,
  last_calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sca_salesperson ON public.salesperson_coaching_aggregates(salesperson_id);
CREATE INDEX idx_sca_avg_overall ON public.salesperson_coaching_aggregates(avg_overall DESC);

ALTER TABLE public.salesperson_coaching_aggregates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sca_read_authenticated" ON public.salesperson_coaching_aggregates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "sca_write_admin_manager" ON public.salesperson_coaching_aggregates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.salesperson_coaching_aggregates;
ALTER TABLE public.salesperson_coaching_aggregates REPLICA IDENTITY FULL;
