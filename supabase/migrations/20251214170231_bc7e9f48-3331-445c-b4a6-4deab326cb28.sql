-- Create table for circuit breaker events history
CREATE TABLE public.circuit_breaker_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  circuit_name TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'opened', 'closed', 'half_open', 'failure', 'success'
  previous_state TEXT,
  new_state TEXT,
  failure_count INTEGER DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_circuit_breaker_events_circuit_name ON public.circuit_breaker_events(circuit_name);
CREATE INDEX idx_circuit_breaker_events_created_at ON public.circuit_breaker_events(created_at DESC);
CREATE INDEX idx_circuit_breaker_events_event_type ON public.circuit_breaker_events(event_type);

-- Enable RLS
ALTER TABLE public.circuit_breaker_events ENABLE ROW LEVEL SECURITY;

-- Only admins/managers can view circuit breaker events
CREATE POLICY "Admins and managers can view circuit breaker events"
ON public.circuit_breaker_events
FOR SELECT
USING (is_admin_or_manager(auth.uid()));

-- Allow insert for all authenticated (events logged from client)
CREATE POLICY "Authenticated users can log circuit breaker events"
ON public.circuit_breaker_events
FOR INSERT
WITH CHECK (is_authenticated());

-- Admins can delete old events for cleanup
CREATE POLICY "Admins can delete circuit breaker events"
ON public.circuit_breaker_events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));