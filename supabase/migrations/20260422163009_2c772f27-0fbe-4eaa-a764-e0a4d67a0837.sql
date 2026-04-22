CREATE TABLE IF NOT EXISTS public.winloss_alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  consecutive_failures integer NOT NULL DEFAULT 5 CHECK (consecutive_failures BETWEEN 1 AND 100),
  retry_rate_threshold numeric NOT NULL DEFAULT 0.5 CHECK (retry_rate_threshold >= 0 AND retry_rate_threshold <= 1),
  window_minutes integer NOT NULL DEFAULT 30 CHECK (window_minutes BETWEEN 5 AND 1440),
  min_deliveries integer NOT NULL DEFAULT 10 CHECK (min_deliveries BETWEEN 1 AND 10000),
  suppress_minutes integer NOT NULL DEFAULT 60 CHECK (suppress_minutes BETWEEN 1 AND 1440),
  max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 20),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.winloss_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read winloss_alert_settings"
  ON public.winloss_alert_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert winloss_alert_settings"
  ON public.winloss_alert_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update winloss_alert_settings"
  ON public.winloss_alert_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.touch_winloss_alert_settings()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_winloss_alert_settings ON public.winloss_alert_settings;
CREATE TRIGGER trg_touch_winloss_alert_settings
  BEFORE UPDATE ON public.winloss_alert_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_winloss_alert_settings();

INSERT INTO public.winloss_alert_settings (singleton)
VALUES (true)
ON CONFLICT (singleton) DO NOTHING;