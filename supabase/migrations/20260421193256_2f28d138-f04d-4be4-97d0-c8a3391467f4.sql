-- Generic per-user app settings, namespaced by `key` (e.g. 'winloss-at-risk').
-- Allows cross-device sync of UI preferences without one table per feature.
CREATE TABLE IF NOT EXISTS public.user_app_settings (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

ALTER TABLE public.user_app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users select own app settings"
  ON public.user_app_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own app settings"
  ON public.user_app_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users update own app settings"
  ON public.user_app_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users delete own app settings"
  ON public.user_app_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Reuse existing public.update_updated_at_column() trigger function.
CREATE TRIGGER user_app_settings_touch_updated_at
  BEFORE UPDATE ON public.user_app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_user_app_settings_user_key
  ON public.user_app_settings(user_id, key);