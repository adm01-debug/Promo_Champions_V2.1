
ALTER TABLE public.call_recordings
ADD COLUMN IF NOT EXISTS transcript_tsv tsvector;

CREATE OR REPLACE FUNCTION public.update_call_recording_tsv()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.transcript_tsv := to_tsvector(
    'portuguese',
    coalesce(NEW.transcript, '') || ' ' ||
    coalesce(NEW.summary, '') || ' ' ||
    coalesce(array_to_string(NEW.key_topics, ' '), '') || ' ' ||
    coalesce(NEW.title, '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_call_recording_tsv ON public.call_recordings;
CREATE TRIGGER trg_update_call_recording_tsv
BEFORE INSERT OR UPDATE OF transcript, summary, key_topics, title
ON public.call_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_call_recording_tsv();

UPDATE public.call_recordings
SET transcript_tsv = to_tsvector(
  'portuguese',
  coalesce(transcript, '') || ' ' ||
  coalesce(summary, '') || ' ' ||
  coalesce(array_to_string(key_topics, ' '), '') || ' ' ||
  coalesce(title, '')
)
WHERE transcript_tsv IS NULL;

CREATE INDEX IF NOT EXISTS idx_call_recordings_transcript_tsv
ON public.call_recordings USING GIN (transcript_tsv);

CREATE TABLE IF NOT EXISTS public.competitors_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NULL,
  name TEXT NOT NULL,
  aliases TEXT[] NOT NULL DEFAULT '{}',
  default_battle_card_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitors_registry_active
ON public.competitors_registry(is_active);

ALTER TABLE public.competitors_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view competitors"
ON public.competitors_registry FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and managers can insert competitors"
ON public.competitors_registry FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins and managers can update competitors"
ON public.competitors_registry FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Admins can delete competitors"
ON public.competitors_registry FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_competitors_registry_updated_at
BEFORE UPDATE ON public.competitors_registry
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.competitor_mentions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  competitor_id UUID NULL REFERENCES public.competitors_registry(id) ON DELETE SET NULL,
  competitor_name TEXT NOT NULL,
  timestamp_sec INTEGER NULL,
  context_snippet TEXT NULL,
  battle_card_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitor_mentions_recording
ON public.competitor_mentions(recording_id);

CREATE INDEX IF NOT EXISTS idx_competitor_mentions_competitor
ON public.competitor_mentions(competitor_id);

ALTER TABLE public.competitor_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view mentions of their recordings"
ON public.competitor_mentions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.call_recordings cr
    JOIN public.salespeople sp ON sp.id = cr.salesperson_id
    WHERE cr.id = competitor_mentions.recording_id
      AND (sp.auth_user_id = auth.uid()
           OR public.has_role(auth.uid(), 'admin')
           OR public.has_role(auth.uid(), 'manager'))
  )
);

CREATE POLICY "Owners insert mentions on their recordings"
ON public.competitor_mentions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.call_recordings cr
    JOIN public.salespeople sp ON sp.id = cr.salesperson_id
    WHERE cr.id = competitor_mentions.recording_id
      AND (sp.auth_user_id = auth.uid()
           OR public.has_role(auth.uid(), 'admin')
           OR public.has_role(auth.uid(), 'manager'))
  )
);

CREATE POLICY "Owners delete mentions on their recordings"
ON public.competitor_mentions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.call_recordings cr
    JOIN public.salespeople sp ON sp.id = cr.salesperson_id
    WHERE cr.id = competitor_mentions.recording_id
      AND (sp.auth_user_id = auth.uid()
           OR public.has_role(auth.uid(), 'admin')
           OR public.has_role(auth.uid(), 'manager'))
  )
);

CREATE OR REPLACE FUNCTION public.search_call_library(
  _query TEXT,
  _limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  recorded_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  salesperson_id UUID,
  status TEXT,
  rank REAL,
  snippet TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ts_query tsquery;
  uid UUID := auth.uid();
  is_priv BOOLEAN := public.has_role(uid, 'admin') OR public.has_role(uid, 'manager');
BEGIN
  IF _query IS NULL OR length(trim(_query)) = 0 THEN
    RETURN;
  END IF;

  ts_query := websearch_to_tsquery('portuguese', _query);

  RETURN QUERY
  SELECT
    cr.id,
    cr.title,
    cr.recorded_at,
    cr.duration_seconds,
    cr.salesperson_id,
    cr.status,
    ts_rank(cr.transcript_tsv, ts_query) AS rank,
    ts_headline(
      'portuguese',
      coalesce(cr.transcript, cr.summary, cr.title),
      ts_query,
      'MaxWords=30, MinWords=10, ShortWord=3, HighlightAll=FALSE, MaxFragments=2, FragmentDelimiter=" … "'
    ) AS snippet
  FROM public.call_recordings cr
  LEFT JOIN public.salespeople sp ON sp.id = cr.salesperson_id
  WHERE cr.transcript_tsv @@ ts_query
    AND (is_priv OR sp.auth_user_id = uid)
  ORDER BY rank DESC, cr.recorded_at DESC
  LIMIT greatest(1, least(_limit, 100));
END;
$$;
