CREATE TABLE public.edge_retry_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  attempt INTEGER NOT NULL CHECK (attempt >= 1),
  total_attempts INTEGER,
  outcome TEXT NOT NULL CHECK (outcome IN ('retry','success_after_retry','exhausted','non_retryable')),
  status_code INTEGER,
  error_name TEXT,
  error_message TEXT,
  delay_ms INTEGER,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.edge_retry_events TO authenticated;
GRANT ALL ON public.edge_retry_events TO service_role;

ALTER TABLE public.edge_retry_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_can_read_edge_retry_events"
  ON public.edge_retry_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "service_role_can_insert_edge_retry_events"
  ON public.edge_retry_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX idx_edge_retry_events_fn_created
  ON public.edge_retry_events (function_name, created_at DESC);

CREATE INDEX idx_edge_retry_events_outcome_created
  ON public.edge_retry_events (outcome, created_at DESC);