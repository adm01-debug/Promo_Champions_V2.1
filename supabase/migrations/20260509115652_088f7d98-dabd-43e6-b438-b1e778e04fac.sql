-- Create a unified table for integration monitoring
CREATE TABLE IF NOT EXISTS public.integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT now(),
    integration_type TEXT NOT NULL, -- 'email', 'push', 'auth'
    event_type TEXT NOT NULL, -- 'dispatch', 'confirmation', 'error', 'config_check'
    status TEXT NOT NULL, -- 'success', 'error', 'pending'
    details JSONB,
    recipient TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users (admins/monitors)
CREATE POLICY "Allow authenticated users to view integration logs"
    ON public.integration_logs
    FOR SELECT
    TO authenticated
    USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_logs_type ON public.integration_logs(integration_type);
CREATE INDEX IF NOT EXISTS idx_integration_logs_status ON public.integration_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_logs_timestamp ON public.integration_logs(timestamp DESC);

-- Example seed for initial validation
INSERT INTO public.integration_logs (integration_type, event_type, status, details, recipient)
VALUES 
('email', 'config_check', 'success', '{"check": "SMTP Connection", "latency": "45ms"}', 'system'),
('push', 'config_check', 'success', '{"check": "FCM Token Auth", "latency": "12ms"}', 'system');
