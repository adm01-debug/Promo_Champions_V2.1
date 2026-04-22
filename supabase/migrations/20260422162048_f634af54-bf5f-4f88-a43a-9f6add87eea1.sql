ALTER TABLE public.winloss_webhook_alerts
  DROP CONSTRAINT IF EXISTS winloss_webhook_alerts_kind_check;

ALTER TABLE public.winloss_webhook_alerts
  ADD CONSTRAINT winloss_webhook_alerts_kind_check
  CHECK (kind = ANY (ARRAY['consecutive_failures'::text, 'high_retry_rate'::text, 'attempts_exhausted'::text]));