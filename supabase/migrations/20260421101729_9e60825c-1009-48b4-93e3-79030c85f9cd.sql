-- Preferências de dashboard por usuário
CREATE TABLE IF NOT EXISTS public.user_winloss_preferences (
  user_id UUID PRIMARY KEY,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_winloss_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own prefs select" ON public.user_winloss_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own prefs insert" ON public.user_winloss_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own prefs update" ON public.user_winloss_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own prefs delete" ON public.user_winloss_preferences
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Webhook subscriptions (admin only)
CREATE TABLE IF NOT EXISTS public.winloss_webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['critical_pattern','anomaly','perf_drop'],
  active BOOLEAN NOT NULL DEFAULT true,
  secret TEXT,
  last_dispatch_at TIMESTAMPTZ,
  last_status INT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.winloss_webhook_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin manage webhooks" ON public.winloss_webhook_subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS idx_winloss_webhook_active ON public.winloss_webhook_subscriptions(active) WHERE active = true;