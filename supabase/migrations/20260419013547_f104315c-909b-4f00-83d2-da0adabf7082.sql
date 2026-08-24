CREATE TABLE IF NOT EXISTS public.race_overlay_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  overlay_name TEXT NOT NULL,
  viewed_count INTEGER NOT NULL DEFAULT 1,
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, overlay_name)
);

CREATE INDEX IF NOT EXISTS idx_race_overlay_telemetry_overlay
  ON public.race_overlay_telemetry (overlay_name, last_viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_race_overlay_telemetry_user
  ON public.race_overlay_telemetry (user_id);

ALTER TABLE public.race_overlay_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their overlay telemetry"
  ON public.race_overlay_telemetry FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their overlay telemetry"
  ON public.race_overlay_telemetry FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read their overlay telemetry"
  ON public.race_overlay_telemetry FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all overlay telemetry"
  ON public.race_overlay_telemetry FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));