CREATE TABLE public.call_sentiment_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL REFERENCES public.call_recordings(id) ON DELETE CASCADE,
  segment_index int NOT NULL,
  start_sec int NOT NULL DEFAULT 0,
  end_sec int NOT NULL DEFAULT 0,
  speaker text NOT NULL DEFAULT 'unknown' CHECK (speaker IN ('salesperson','client','unknown','mixed')),
  sentiment text NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('very_negative','negative','neutral','positive','very_positive')),
  score numeric NOT NULL DEFAULT 0 CHECK (score >= -1 AND score <= 1),
  confidence numeric NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  excerpt text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sentiment_timeline_recording ON public.call_sentiment_timeline(recording_id, start_sec);

ALTER TABLE public.call_sentiment_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View sentiment of own/managed recordings"
ON public.call_sentiment_timeline
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.call_recordings cr
    WHERE cr.id = call_sentiment_timeline.recording_id
      AND (
        cr.salesperson_id = public.get_current_salesperson_id()
        OR public.has_role(auth.uid(), 'admin'::app_role)
        OR public.has_role(auth.uid(), 'manager'::app_role)
      )
  )
);

CREATE POLICY "Service role manages sentiment timeline"
ON public.call_sentiment_timeline
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE VIEW public.call_sentiment_summary
WITH (security_invoker = true)
AS
SELECT
  recording_id,
  COUNT(*) AS segments_count,
  AVG(score)::numeric(4,3) AS avg_score,
  AVG(score) FILTER (WHERE speaker = 'salesperson')::numeric(4,3) AS avg_score_salesperson,
  AVG(score) FILTER (WHERE speaker = 'client')::numeric(4,3) AS avg_score_client,
  COUNT(*) FILTER (WHERE sentiment IN ('positive','very_positive')) AS positive_count,
  COUNT(*) FILTER (WHERE sentiment IN ('negative','very_negative')) AS negative_count
FROM public.call_sentiment_timeline
GROUP BY recording_id;