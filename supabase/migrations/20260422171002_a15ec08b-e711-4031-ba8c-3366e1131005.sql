-- Metrics table for webhook dispatcher events that need silent monitoring
CREATE TABLE IF NOT EXISTS public.winloss_webhook_dispatch_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric text NOT NULL,
  event text NOT NULL,
  request_id text,
  active_subscriptions_count integer NOT NULL DEFAULT 0,
  matching_subscriptions_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_winloss_webhook_dispatch_metrics_metric_created
  ON public.winloss_webhook_dispatch_metrics (metric, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_winloss_webhook_dispatch_metrics_event_created
  ON public.winloss_webhook_dispatch_metrics (event, created_at DESC);

ALTER TABLE public.winloss_webhook_dispatch_metrics ENABLE ROW LEVEL SECURITY;

-- Only admins may inspect dispatcher metrics
CREATE POLICY "Admins can view dispatch metrics"
  ON public.winloss_webhook_dispatch_metrics
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role inserts only (edge function); no client inserts
CREATE POLICY "Service role can insert dispatch metrics"
  ON public.winloss_webhook_dispatch_metrics
  FOR INSERT
  TO service_role
  WITH CHECK (true);