
-- V4 callback alert settings (singleton) + alert history
CREATE TABLE IF NOT EXISTS public.v4_callback_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  failure_rate_threshold NUMERIC NOT NULL DEFAULT 20,        -- % failed/(ok+failed) na janela
  exhausted_threshold_24h INTEGER NOT NULL DEFAULT 5,        -- nº esgotados nas últimas 24h
  pending_threshold INTEGER NOT NULL DEFAULT 50,             -- nº pendentes acumulados
  window_minutes INTEGER NOT NULL DEFAULT 60,                -- janela p/ taxa de falha
  min_events INTEGER NOT NULL DEFAULT 10,                    -- mínimo p/ avaliar taxa
  suppress_minutes INTEGER NOT NULL DEFAULT 30,              -- anti-flood
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.v4_callback_alert_settings TO authenticated;
GRANT ALL ON public.v4_callback_alert_settings TO service_role;
ALTER TABLE public.v4_callback_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage v4 callback alert settings"
ON public.v4_callback_alert_settings FOR ALL TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

INSERT INTO public.v4_callback_alert_settings (singleton) VALUES (true)
ON CONFLICT (singleton) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.v4_callback_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('high_failure_rate','exhausted_spike','pending_backlog')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  fired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID
);

GRANT SELECT, INSERT, UPDATE ON public.v4_callback_alerts TO authenticated;
GRANT ALL ON public.v4_callback_alerts TO service_role;
ALTER TABLE public.v4_callback_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read v4 callback alerts"
ON public.v4_callback_alerts FOR SELECT TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins ack v4 callback alerts"
ON public.v4_callback_alerts FOR UPDATE TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Service role writes v4 callback alerts"
ON public.v4_callback_alerts FOR INSERT TO service_role
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_v4_callback_alerts_fired_at ON public.v4_callback_alerts (fired_at DESC);
