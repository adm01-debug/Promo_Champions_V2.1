
CREATE TABLE IF NOT EXISTS public.executive_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  briefing_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pulse_score INTEGER NOT NULL DEFAULT 0,
  headline TEXT NOT NULL,
  narrative TEXT NOT NULL DEFAULT '',
  key_wins JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_by TEXT NOT NULL DEFAULT 'manual' CHECK (generated_by IN ('auto', 'manual')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (briefing_date)
);

CREATE INDEX IF NOT EXISTS idx_executive_briefings_date_desc
  ON public.executive_briefings (briefing_date DESC);

ALTER TABLE public.executive_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view briefings"
  ON public.executive_briefings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers and admins can create briefings"
  ON public.executive_briefings FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "Admins can update briefings"
  ON public.executive_briefings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete briefings"
  ON public.executive_briefings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.latest_briefing_view AS
SELECT *
FROM public.executive_briefings
ORDER BY briefing_date DESC, created_at DESC
LIMIT 1;
