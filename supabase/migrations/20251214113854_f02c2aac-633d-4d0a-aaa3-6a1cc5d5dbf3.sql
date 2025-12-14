-- Create table for access denied logs
CREATE TABLE public.access_denied_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT,
  attempted_path TEXT NOT NULL,
  user_role TEXT,
  required_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.access_denied_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Admins can view access logs"
ON public.access_denied_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Authenticated users can insert their own access denied logs
CREATE POLICY "Authenticated users can log access denied"
ON public.access_denied_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_access_denied_logs_user_id ON public.access_denied_logs(user_id);
CREATE INDEX idx_access_denied_logs_created_at ON public.access_denied_logs(created_at DESC);