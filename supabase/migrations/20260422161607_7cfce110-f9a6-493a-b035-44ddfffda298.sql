ALTER TABLE public.winloss_webhook_alerts
  ADD COLUMN IF NOT EXISTS request_id uuid;

CREATE INDEX IF NOT EXISTS idx_winloss_webhook_alerts_request_id
  ON public.winloss_webhook_alerts (request_id);

ALTER TABLE public.winloss_webhook_dead_letters
  ADD COLUMN IF NOT EXISTS last_replay_request_id uuid;

CREATE INDEX IF NOT EXISTS idx_winloss_webhook_dlq_last_replay_request_id
  ON public.winloss_webhook_dead_letters (last_replay_request_id);