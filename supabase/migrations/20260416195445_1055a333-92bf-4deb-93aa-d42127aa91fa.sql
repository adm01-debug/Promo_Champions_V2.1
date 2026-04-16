-- Tabela principal de gravações
CREATE TABLE public.call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  audio_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','transcribing','analyzing','ready','failed')),
  participants JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_recordings_salesperson ON public.call_recordings(salesperson_id);
CREATE INDEX idx_call_recordings_sale ON public.call_recordings(sale_id);
CREATE INDEX idx_call_recordings_recorded_at ON public.call_recordings(recorded_at DESC);

ALTER TABLE public.call_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salespeople view own recordings"
  ON public.call_recordings FOR SELECT
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

CREATE POLICY "Salespeople create own recordings"
  ON public.call_recordings FOR INSERT
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Salespeople update own recordings"
  ON public.call_recordings FOR UPDATE
  USING (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins delete recordings"
  ON public.call_recordings FOR DELETE
  USING (public.is_admin_or_manager(auth.uid()));

-- Trigger updated_at
CREATE TRIGGER update_call_recordings_updated_at
  BEFORE UPDATE ON public.call_recordings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Transcrições segmentadas
CREATE TABLE public.call_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  full_text TEXT NOT NULL,
  segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  language TEXT DEFAULT 'pt-BR',
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_transcripts_recording ON public.call_transcripts(recording_id);

ALTER TABLE public.call_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View transcripts via recording access"
  ON public.call_transcripts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.call_recordings r
    WHERE r.id = recording_id
      AND (r.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ));

CREATE POLICY "System inserts transcripts"
  ON public.call_transcripts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.call_recordings r
    WHERE r.id = recording_id
      AND (r.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ));

-- Insights de IA
CREATE TABLE public.call_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  sentiment_score NUMERIC(4,3),
  sentiment_label TEXT CHECK (sentiment_label IN ('very_negative','negative','neutral','positive','very_positive')),
  talk_ratio_salesperson NUMERIC(5,2),
  talk_ratio_client NUMERIC(5,2),
  topics JSONB DEFAULT '[]'::jsonb,
  objections JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  key_moments JSONB DEFAULT '[]'::jsonb,
  coaching_tips JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  questions_asked INTEGER DEFAULT 0,
  ai_model TEXT DEFAULT 'google/gemini-2.5-flash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_call_insights_recording ON public.call_insights(recording_id);

ALTER TABLE public.call_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View insights via recording access"
  ON public.call_insights FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.call_recordings r
    WHERE r.id = recording_id
      AND (r.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ));

CREATE POLICY "System inserts insights"
  ON public.call_insights FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.call_recordings r
    WHERE r.id = recording_id
      AND (r.salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()))
  ));

-- Storage bucket para áudios
INSERT INTO storage.buckets (id, name, public)
VALUES ('call-recordings', 'call-recordings', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Salespeople upload own call audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'call-recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Salespeople read own call audio"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'call-recordings'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin_or_manager(auth.uid()))
  );

CREATE POLICY "Salespeople delete own call audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'call-recordings'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin_or_manager(auth.uid()))
  );