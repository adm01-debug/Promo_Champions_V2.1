
-- Dedupe state for churn alerts (only notify on new or escalated urgency per client/day)
CREATE TABLE IF NOT EXISTS public.client_churn_alerts_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id uuid NOT NULL,
  client_name text NOT NULL,
  last_level text NOT NULL CHECK (last_level IN ('low','medium','high','critical')),
  last_days_since integer NOT NULL,
  last_alerted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (salesperson_id, client_name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_churn_alerts_state TO authenticated;
GRANT ALL ON public.client_churn_alerts_state TO service_role;

ALTER TABLE public.client_churn_alerts_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all churn alert state"
  ON public.client_churn_alerts_state FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own churn alert state"
  ON public.client_churn_alerts_state FOR SELECT TO authenticated
  USING (salesperson_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_churn_alerts_state_salesperson
  ON public.client_churn_alerts_state(salesperson_id);

-- Settings singleton
CREATE TABLE IF NOT EXISTS public.churn_alert_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  enabled boolean NOT NULL DEFAULT true,
  min_level text NOT NULL DEFAULT 'high' CHECK (min_level IN ('low','medium','high','critical')),
  cooldown_hours integer NOT NULL DEFAULT 24 CHECK (cooldown_hours >= 1),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.churn_alert_settings TO authenticated;
GRANT ALL ON public.churn_alert_settings TO service_role;

ALTER TABLE public.churn_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read churn alert settings"
  ON public.churn_alert_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage churn alert settings"
  ON public.churn_alert_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.churn_alert_settings (id) VALUES (true) ON CONFLICT DO NOTHING;
