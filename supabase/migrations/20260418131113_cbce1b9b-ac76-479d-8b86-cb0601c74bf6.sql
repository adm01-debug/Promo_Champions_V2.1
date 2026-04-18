-- Skill Assessments Table
CREATE TABLE public.skill_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  skill TEXT NOT NULL CHECK (skill IN ('discovery','qualification','objection_handling','closing','prospecting','negotiation')),
  current_level TEXT NOT NULL DEFAULT 'beginner' CHECK (current_level IN ('beginner','intermediate','advanced','expert')),
  score NUMERIC NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('improving','stable','declining')),
  gap_count_30d INT NOT NULL DEFAULT 0,
  gap_count_90d INT NOT NULL DEFAULT 0,
  last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salesperson_id, skill)
);

CREATE INDEX idx_skill_assessments_sp ON public.skill_assessments(salesperson_id);
CREATE INDEX idx_skill_assessments_skill ON public.skill_assessments(skill);
CREATE INDEX idx_skill_assessments_score ON public.skill_assessments(score);
CREATE INDEX idx_skill_assessments_assessed ON public.skill_assessments(last_assessed_at DESC);

ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read skill_assessments"
  ON public.skill_assessments FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admin/manager insert skill_assessments"
  ON public.skill_assessments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "Admin/manager update skill_assessments"
  ON public.skill_assessments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "Admin/manager delete skill_assessments"
  ON public.skill_assessments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE TRIGGER update_skill_assessments_updated_at
  BEFORE UPDATE ON public.skill_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_assessments;
ALTER TABLE public.skill_assessments REPLICA IDENTITY FULL;

-- Skill Development Tracks Table
CREATE TABLE public.skill_development_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  skill TEXT NOT NULL CHECK (skill IN ('discovery','qualification','objection_handling','closing','prospecting','negotiation')),
  priority INT NOT NULL DEFAULT 1,
  current_level TEXT NOT NULL DEFAULT 'beginner',
  target_level TEXT NOT NULL DEFAULT 'intermediate',
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_weeks INT NOT NULL DEFAULT 4,
  ai_plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salesperson_id, skill)
);

CREATE INDEX idx_skill_tracks_sp ON public.skill_development_tracks(salesperson_id);
CREATE INDEX idx_skill_tracks_priority ON public.skill_development_tracks(priority);
CREATE INDEX idx_skill_tracks_created ON public.skill_development_tracks(created_at DESC);

ALTER TABLE public.skill_development_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read skill_tracks"
  ON public.skill_development_tracks FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admin/manager insert skill_tracks"
  ON public.skill_development_tracks FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "Admin/manager update skill_tracks"
  ON public.skill_development_tracks FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "Admin/manager delete skill_tracks"
  ON public.skill_development_tracks FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE TRIGGER update_skill_tracks_updated_at
  BEFORE UPDATE ON public.skill_development_tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_development_tracks;
ALTER TABLE public.skill_development_tracks REPLICA IDENTITY FULL;