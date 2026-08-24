-- Dead-letter queue para webhooks Win/Loss que falharam após todas as tentativas
CREATE TABLE public.winloss_webhook_dead_letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.winloss_webhook_subscriptions(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  last_status SMALLINT NOT NULL,
  last_error TEXT,
  attempts SMALLINT NOT NULL,
  total_latency_ms INTEGER NOT NULL,
  request_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','replaying','replayed','archived')),
  replay_count SMALLINT NOT NULL DEFAULT 0,
  last_replay_at TIMESTAMPTZ,
  last_replay_status SMALLINT,
  last_replay_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_winloss_dlq_status_created ON public.winloss_webhook_dead_letters(status, created_at DESC);
CREATE INDEX idx_winloss_dlq_subscription ON public.winloss_webhook_dead_letters(subscription_id);

ALTER TABLE public.winloss_webhook_dead_letters ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ler e atualizar
CREATE POLICY "Admins can view dead letters"
  ON public.winloss_webhook_dead_letters FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update dead letters"
  ON public.winloss_webhook_dead_letters FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER update_winloss_dlq_updated_at
  BEFORE UPDATE ON public.winloss_webhook_dead_letters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();