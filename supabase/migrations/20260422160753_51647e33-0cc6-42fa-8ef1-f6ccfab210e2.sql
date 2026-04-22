-- Add request_id to webhook deliveries to enable correlation across logs/timeline
ALTER TABLE public.winloss_webhook_deliveries
  ADD COLUMN IF NOT EXISTS request_id UUID;

CREATE INDEX IF NOT EXISTS idx_winloss_webhook_deliveries_request_id
  ON public.winloss_webhook_deliveries (request_id)
  WHERE request_id IS NOT NULL;