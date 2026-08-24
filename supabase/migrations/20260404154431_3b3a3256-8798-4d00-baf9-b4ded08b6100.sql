
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  stack_trace TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'unknown',
  component TEXT,
  metadata JSONB DEFAULT '{}',
  url TEXT,
  user_agent TEXT,
  user_id UUID DEFAULT auth.uid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert error logs"
ON public.error_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Only admins can view error logs"
ON public.error_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_error_logs_created_at ON public.error_logs (created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs (severity);
CREATE INDEX idx_error_logs_category ON public.error_logs (category);
