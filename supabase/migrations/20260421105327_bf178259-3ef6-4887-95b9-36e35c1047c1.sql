-- Tabela de histórico de entregas de webhooks (auditoria/troubleshooting)
CREATE TABLE public.winloss_webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES public.winloss_webhook_subscriptions(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  attempt SMALLINT NOT NULL,
  status SMALLINT NOT NULL DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  succeeded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_winloss_webhook_deliveries_sub ON public.winloss_webhook_deliveries(subscription_id, created_at DESC);
CREATE INDEX idx_winloss_webhook_deliveries_event ON public.winloss_webhook_deliveries(event, created_at DESC);

ALTER TABLE public.winloss_webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ler o histórico
CREATE POLICY "Admins read webhook deliveries"
ON public.winloss_webhook_deliveries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Service role insere via edge function (sem policy de INSERT para usuários comuns)
