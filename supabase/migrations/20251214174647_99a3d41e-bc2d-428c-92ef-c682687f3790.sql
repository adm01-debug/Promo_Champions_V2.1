-- Create table for Bitrix24 sync history
CREATE TABLE public.bitrix24_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL DEFAULT 'sync-all',
  status TEXT NOT NULL DEFAULT 'success',
  companies_from_bitrix INTEGER DEFAULT 0,
  companies_to_bitrix INTEGER DEFAULT 0,
  deals_from_bitrix INTEGER DEFAULT 0,
  deals_to_bitrix INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER,
  triggered_by TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bitrix24_sync_logs ENABLE ROW LEVEL SECURITY;

-- Admins and managers can view sync logs
CREATE POLICY "Admins and managers can view sync logs"
ON public.bitrix24_sync_logs
FOR SELECT
USING (is_admin_or_manager(auth.uid()));

-- Service role can insert logs (from edge function)
CREATE POLICY "Service role can insert sync logs"
ON public.bitrix24_sync_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_bitrix24_sync_logs_created_at ON public.bitrix24_sync_logs(created_at DESC);