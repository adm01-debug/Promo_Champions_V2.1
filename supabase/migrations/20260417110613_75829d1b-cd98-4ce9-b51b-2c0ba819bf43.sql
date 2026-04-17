
-- 1. Columns on sequences
ALTER TABLE public.sequences
  ADD COLUMN IF NOT EXISTS auto_pause_on_reply boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_pause_on_bounce boolean NOT NULL DEFAULT true;

-- 2. Columns on sequence_enrollments
ALTER TABLE public.sequence_enrollments
  ADD COLUMN IF NOT EXISTS auto_paused_at timestamptz,
  ADD COLUMN IF NOT EXISTS auto_pause_reason text;

-- 3. Inbound reply events table
CREATE TABLE IF NOT EXISTS public.inbound_reply_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  message_id text,
  from_email text,
  subject text,
  received_at timestamptz NOT NULL DEFAULT now(),
  matched_enrollment_id uuid REFERENCES public.sequence_enrollments(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT 'reply',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbound_reply_events_received_at ON public.inbound_reply_events (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbound_reply_events_from_email ON public.inbound_reply_events (lower(from_email));

ALTER TABLE public.inbound_reply_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view inbound reply events" ON public.inbound_reply_events;
CREATE POLICY "Admins can view inbound reply events"
  ON public.inbound_reply_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. RPC: match reply email to active enrollment
CREATE OR REPLACE FUNCTION public.match_reply_to_enrollment(
  _contact_email text,
  _received_at timestamptz DEFAULT now()
)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enrollment_id uuid;
BEGIN
  IF _contact_email IS NULL OR length(trim(_contact_email)) = 0 THEN
    RETURN NULL;
  END IF;

  -- Try via sales (leads/deals) email
  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.sales s ON s.id = se.contact_id AND se.contact_type = 'lead'
  WHERE lower(s.email) = lower(_contact_email)
    AND se.status IN ('active','scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY se.started_at DESC
  LIMIT 1;

  IF _enrollment_id IS NOT NULL THEN
    RETURN _enrollment_id;
  END IF;

  -- Try via clients email
  SELECT se.id INTO _enrollment_id
  FROM public.sequence_enrollments se
  JOIN public.clients c ON c.id = se.contact_id AND se.contact_type = 'client'
  WHERE lower(c.email) = lower(_contact_email)
    AND se.status IN ('active','scheduled')
    AND se.auto_paused_at IS NULL
    AND se.started_at <= _received_at
  ORDER BY se.started_at DESC
  LIMIT 1;

  RETURN _enrollment_id;
END;
$$;

-- 5. RPC: auto pause enrollment
CREATE OR REPLACE FUNCTION public.auto_pause_enrollment(
  _enrollment_id uuid,
  _reason text DEFAULT 'reply_detected'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enr record;
BEGIN
  SELECT id, contact_id, contact_type, status
    INTO _enr
  FROM public.sequence_enrollments
  WHERE id = _enrollment_id;

  IF _enr.id IS NULL THEN
    RETURN;
  END IF;

  IF _enr.status = 'paused' THEN
    RETURN;
  END IF;

  UPDATE public.sequence_enrollments
     SET status = 'paused',
         auto_paused_at = now(),
         auto_pause_reason = COALESCE(_reason, 'reply_detected'),
         next_action_at = NULL
   WHERE id = _enrollment_id;

  -- Record engagement signal + recompute (best-effort)
  BEGIN
    PERFORM public.record_engagement_signal(_enr.contact_id, _enr.contact_type, 'reply', now());
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    PERFORM public.recompute_engagement_score(_enr.contact_id, _enr.contact_type);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$$;

-- 6. Trigger on activities → auto pause active enrollments for that contact
CREATE OR REPLACE FUNCTION public.trg_activities_auto_pause_sequences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _enr record;
BEGIN
  -- Only react to inbound-style activities
  IF NEW.activity_type::text NOT IN ('reply','email_received','whatsapp_inbound','inbound_message') THEN
    RETURN NEW;
  END IF;

  IF NEW.sale_id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR _enr IN
    SELECT se.id
    FROM public.sequence_enrollments se
    JOIN public.sequences s ON s.id = se.sequence_id
    WHERE se.contact_id = NEW.sale_id
      AND se.contact_type = 'lead'
      AND se.status IN ('active','scheduled')
      AND se.auto_paused_at IS NULL
      AND s.auto_pause_on_reply = true
  LOOP
    PERFORM public.auto_pause_enrollment(_enr.id, 'manual_activity');
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activities_auto_pause ON public.activities;
CREATE TRIGGER trg_activities_auto_pause
AFTER INSERT ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.trg_activities_auto_pause_sequences();
