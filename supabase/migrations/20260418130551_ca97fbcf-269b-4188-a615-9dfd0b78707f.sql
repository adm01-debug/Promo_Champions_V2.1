-- Coaching Opportunities
CREATE TABLE public.coaching_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id uuid NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  metric_key text NOT NULL CHECK (metric_key IN ('conversion_rate','stage_duration','win_rate','avg_ticket','activities_per_day')),
  metric_label text NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  team_benchmark numeric NOT NULL DEFAULT 0,
  gap_pct numeric GENERATED ALWAYS AS (
    CASE WHEN team_benchmark = 0 THEN 0
         ELSE ((team_benchmark - current_value) / team_benchmark) * 100
    END
  ) STORED,
  severity text NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high','critical')),
  skill_focus text NOT NULL CHECK (skill_focus IN ('discovery','qualification','objection_handling','closing','prospecting','negotiation')),
  recommended_action text,
  priority int NOT NULL DEFAULT 1,
  detected_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX coaching_opportunities_unique_per_day
  ON public.coaching_opportunities (salesperson_id, metric_key, ((detected_at AT TIME ZONE 'UTC')::date));
CREATE INDEX idx_coaching_opp_salesperson ON public.coaching_opportunities(salesperson_id);
CREATE INDEX idx_coaching_opp_severity ON public.coaching_opportunities(severity);
CREATE INDEX idx_coaching_opp_detected ON public.coaching_opportunities(detected_at DESC);

ALTER TABLE public.coaching_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaching_opp_read_authenticated"
  ON public.coaching_opportunities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "coaching_opp_write_admin_manager"
  ON public.coaching_opportunities FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.coaching_opportunities;
ALTER TABLE public.coaching_opportunities REPLICA IDENTITY FULL;

-- Coaching Skill Benchmarks
CREATE TABLE public.coaching_skill_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key text NOT NULL UNIQUE CHECK (metric_key IN ('conversion_rate','stage_duration','win_rate','avg_ticket','activities_per_day')),
  team_avg numeric NOT NULL DEFAULT 0,
  top_quartile numeric NOT NULL DEFAULT 0,
  sample_size int NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coaching_skill_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coaching_bench_read_authenticated"
  ON public.coaching_skill_benchmarks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "coaching_bench_write_admin_manager"
  ON public.coaching_skill_benchmarks FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.coaching_skill_benchmarks;
ALTER TABLE public.coaching_skill_benchmarks REPLICA IDENTITY FULL;