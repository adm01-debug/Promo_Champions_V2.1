-- Conversation Intelligence 3/4: Objection Handling Tracker

CREATE TABLE public.call_objection_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id uuid NOT NULL UNIQUE REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  total_objections int NOT NULL DEFAULT 0,
  resolved_count int NOT NULL DEFAULT 0,
  partially_resolved_count int NOT NULL DEFAULT 0,
  unresolved_count int NOT NULL DEFAULT 0,
  avg_response_time_seconds numeric NOT NULL DEFAULT 0,
  handling_score numeric NOT NULL DEFAULT 0,
  health text NOT NULL DEFAULT 'fair',
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.call_objections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id uuid NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  client_turn_index int NOT NULL DEFAULT 0,
  objection_text text NOT NULL,
  objection_type text NOT NULL DEFAULT 'other',
  seller_response_text text,
  response_quality text NOT NULL DEFAULT 'ignored',
  resolution_status text NOT NULL DEFAULT 'unresolved',
  start_estimate numeric NOT NULL DEFAULT 0,
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.objection_library (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objection_type text NOT NULL,
  pattern_text text NOT NULL,
  frequency_count int NOT NULL DEFAULT 1,
  best_response_text text,
  best_response_recording_id uuid REFERENCES public.call_recordings(id) ON DELETE SET NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (objection_type, pattern_text)
);

CREATE INDEX idx_call_objections_recording ON public.call_objections(recording_id);
CREATE INDEX idx_call_objections_type ON public.call_objections(objection_type);
CREATE INDEX idx_objection_library_type_seen ON public.objection_library(objection_type, last_seen_at DESC);

ALTER TABLE public.call_objection_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objection_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read objection analysis"
  ON public.call_objection_analysis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/manager write objection analysis"
  ON public.call_objection_analysis FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Authenticated read call objections"
  ON public.call_objections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/manager write call objections"
  ON public.call_objections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Authenticated read objection library"
  ON public.objection_library FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/manager write objection library"
  ON public.objection_library FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.call_objection_analysis;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_objections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.objection_library;

ALTER TABLE public.call_objection_analysis REPLICA IDENTITY FULL;
ALTER TABLE public.call_objections REPLICA IDENTITY FULL;
ALTER TABLE public.objection_library REPLICA IDENTITY FULL;