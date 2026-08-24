-- Twilio call sessions
CREATE TABLE public.twilio_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  queue_item_id UUID REFERENCES public.dialer_queue_items(id) ON DELETE SET NULL,
  call_sid TEXT UNIQUE,
  from_number TEXT,
  to_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated',
  duration_seconds INT,
  recording_url TEXT,
  recording_sid TEXT,
  price NUMERIC,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_twilio_sessions_owner_created ON public.twilio_call_sessions(owner_id, created_at DESC);
CREATE INDEX idx_twilio_sessions_call_sid ON public.twilio_call_sessions(call_sid);
CREATE INDEX idx_twilio_sessions_sale ON public.twilio_call_sessions(sale_id);

ALTER TABLE public.twilio_call_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own twilio sessions"
ON public.twilio_call_sessions FOR SELECT
USING (
  auth.uid() = owner_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Owners can insert own twilio sessions"
ON public.twilio_call_sessions FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own twilio sessions"
ON public.twilio_call_sessions FOR UPDATE
USING (
  auth.uid() = owner_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'manager')
);

-- Service role bypasses RLS by default for webhook updates from edge functions

-- Add call_sid link on call_logs
ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS call_sid TEXT;
CREATE INDEX IF NOT EXISTS idx_call_logs_call_sid ON public.call_logs(call_sid);