
-- Table: contact_send_time_profile
CREATE TABLE public.contact_send_time_profile (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id uuid NOT NULL,
  contact_type text NOT NULL CHECK (contact_type IN ('lead', 'client')),
  hour_of_day smallint NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  opens int NOT NULL DEFAULT 0,
  clicks int NOT NULL DEFAULT 0,
  replies int NOT NULL DEFAULT 0,
  score numeric GENERATED ALWAYS AS (opens * 1.0 + clicks * 2.0 + replies * 5.0) STORED,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, contact_type, hour_of_day, day_of_week)
);

CREATE INDEX idx_cstp_contact ON public.contact_send_time_profile (contact_id, contact_type);
CREATE INDEX idx_cstp_score ON public.contact_send_time_profile (contact_id, contact_type, score DESC);

ALTER TABLE public.contact_send_time_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "STO profiles readable by managers and admins"
ON public.contact_send_time_profile
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'manager'::app_role)
  OR public.has_role(auth.uid(), 'salesperson'::app_role)
);

CREATE POLICY "STO profiles writable by service role only"
ON public.contact_send_time_profile
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add columns to sequences and enrollments
ALTER TABLE public.sequences
  ADD COLUMN IF NOT EXISTS send_time_optimization boolean NOT NULL DEFAULT true;

ALTER TABLE public.sequence_enrollments
  ADD COLUMN IF NOT EXISTS optimized_for_at timestamptz;

-- View: top 3 best windows per contact
CREATE OR REPLACE VIEW public.contact_best_send_window AS
SELECT
  contact_id,
  contact_type,
  hour_of_day,
  day_of_week,
  opens,
  clicks,
  replies,
  score,
  rank
FROM (
  SELECT
    p.*,
    ROW_NUMBER() OVER (PARTITION BY contact_id, contact_type ORDER BY score DESC, updated_at DESC) AS rank
  FROM public.contact_send_time_profile p
  WHERE score > 0
) ranked
WHERE rank <= 3;

-- RPC: compute_optimal_send_time
CREATE OR REPLACE FUNCTION public.compute_optimal_send_time(
  _contact_id uuid,
  _contact_type text,
  _earliest timestamptz
)
RETURNS timestamptz
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  best_hour smallint;
  best_dow smallint;
  candidate timestamptz;
  i int := 0;
BEGIN
  SELECT hour_of_day, day_of_week INTO best_hour, best_dow
  FROM public.contact_send_time_profile
  WHERE contact_id = _contact_id
    AND contact_type = _contact_type
    AND score > 0
  ORDER BY score DESC, updated_at DESC
  LIMIT 1;

  -- Fallback: next weekday at 10:00 UTC
  IF best_hour IS NULL THEN
    candidate := date_trunc('day', _earliest) + interval '10 hours';
    WHILE candidate < _earliest OR EXTRACT(DOW FROM candidate) IN (0, 6) LOOP
      candidate := candidate + interval '1 day';
    END LOOP;
    RETURN candidate;
  END IF;

  -- Find next occurrence of (best_dow, best_hour) >= _earliest
  candidate := date_trunc('day', _earliest) + (best_hour || ' hours')::interval;
  WHILE (EXTRACT(DOW FROM candidate)::int <> best_dow OR candidate < _earliest) AND i < 14 LOOP
    candidate := candidate + interval '1 day';
    i := i + 1;
  END LOOP;

  RETURN candidate;
END;
$$;

-- RPC: record_engagement_signal
CREATE OR REPLACE FUNCTION public.record_engagement_signal(
  _contact_id uuid,
  _contact_type text,
  _signal text,
  _occurred_at timestamptz DEFAULT now()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h smallint;
  d smallint;
BEGIN
  IF _contact_id IS NULL OR _contact_type NOT IN ('lead', 'client') THEN
    RETURN;
  END IF;

  h := EXTRACT(HOUR FROM _occurred_at)::smallint;
  d := EXTRACT(DOW FROM _occurred_at)::smallint;

  INSERT INTO public.contact_send_time_profile
    (contact_id, contact_type, hour_of_day, day_of_week, opens, clicks, replies, updated_at)
  VALUES (
    _contact_id, _contact_type, h, d,
    CASE WHEN _signal = 'open' THEN 1 ELSE 0 END,
    CASE WHEN _signal = 'click' THEN 1 ELSE 0 END,
    CASE WHEN _signal = 'reply' THEN 1 ELSE 0 END,
    now()
  )
  ON CONFLICT (contact_id, contact_type, hour_of_day, day_of_week)
  DO UPDATE SET
    opens = public.contact_send_time_profile.opens + CASE WHEN _signal = 'open' THEN 1 ELSE 0 END,
    clicks = public.contact_send_time_profile.clicks + CASE WHEN _signal = 'click' THEN 1 ELSE 0 END,
    replies = public.contact_send_time_profile.replies + CASE WHEN _signal = 'reply' THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.compute_optimal_send_time(uuid, text, timestamptz) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_engagement_signal(uuid, text, text, timestamptz) TO authenticated, service_role;
