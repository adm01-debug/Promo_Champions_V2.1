ALTER TABLE public.winloss_webhook_alerts
  ADD COLUMN IF NOT EXISTS suppressed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suppress_reason text;

CREATE INDEX IF NOT EXISTS idx_winloss_webhook_alerts_sub_kind_fired
  ON public.winloss_webhook_alerts (subscription_id, kind, fired_at DESC);

CREATE INDEX IF NOT EXISTS idx_winloss_webhook_alerts_fired_at
  ON public.winloss_webhook_alerts (fired_at DESC);