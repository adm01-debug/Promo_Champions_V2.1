ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'none';

COMMENT ON COLUMN public.quotes.last_synced_at IS 'Data da última sincronização com o GIFT STORE';
COMMENT ON COLUMN public.quotes.sync_status IS 'Status de sincronização: none, synced, failed';

-- Update the sync log table to support more details if it exists, or create it
CREATE TABLE IF NOT EXISTS public.quote_sync_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL,
    external_quote_id TEXT,
    action TEXT NOT NULL,
    payload JSONB,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs" 
ON public.quote_sync_logs 
FOR SELECT 
USING (is_admin_or_manager(auth.uid()));
