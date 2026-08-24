-- Create email_logs table to track all email notifications sent
CREATE TABLE public.email_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name text NOT NULL,
  recipient_email text NOT NULL,
  subject text,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins and managers can view email_logs" 
ON public.email_logs 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Service role can insert email_logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX idx_email_logs_function_name ON public.email_logs(function_name);
CREATE INDEX idx_email_logs_status ON public.email_logs(status);