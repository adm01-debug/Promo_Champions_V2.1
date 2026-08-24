
-- Question quality analysis (one row per recording)
CREATE TABLE public.call_question_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL UNIQUE REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  total_questions INT NOT NULL DEFAULT 0,
  open_questions INT NOT NULL DEFAULT 0,
  closed_questions INT NOT NULL DEFAULT 0,
  discovery_questions INT NOT NULL DEFAULT 0,
  impact_questions INT NOT NULL DEFAULT 0,
  leading_questions INT NOT NULL DEFAULT 0,
  avg_depth NUMERIC NOT NULL DEFAULT 0,
  question_density NUMERIC NOT NULL DEFAULT 0,
  quality_score NUMERIC NOT NULL DEFAULT 0,
  health TEXT NOT NULL DEFAULT 'fair' CHECK (health IN ('poor','fair','good','excellent')),
  factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Detailed question list
CREATE TABLE public.call_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  turn_index INT NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('open','closed','discovery','impact','leading','other')),
  depth INT NOT NULL DEFAULT 1,
  start_estimate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_question_analysis_recording ON public.call_question_analysis(recording_id);
CREATE INDEX idx_call_question_analysis_health ON public.call_question_analysis(health, calculated_at DESC);
CREATE INDEX idx_call_questions_recording ON public.call_questions(recording_id);
CREATE INDEX idx_call_questions_category ON public.call_questions(category);

ALTER TABLE public.call_question_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read question analysis" ON public.call_question_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "managers write question analysis" ON public.call_question_analysis FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "auth read questions" ON public.call_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "managers write questions" ON public.call_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.call_question_analysis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_questions;
