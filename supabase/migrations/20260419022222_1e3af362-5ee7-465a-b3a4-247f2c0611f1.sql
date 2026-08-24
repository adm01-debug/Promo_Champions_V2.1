-- Tabela de preferências da Race Arena por usuário
CREATE TABLE IF NOT EXISTS public.race_user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  view_mode TEXT NOT NULL DEFAULT 'focus',
  calm_mode BOOLEAN NOT NULL DEFAULT false,
  audio_muted BOOLEAN NOT NULL DEFAULT true,
  tour_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT race_user_preferences_view_mode_check
    CHECK (view_mode IN ('focus','immersive','competitive','analysis'))
);

ALTER TABLE public.race_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own race preferences"
  ON public.race_user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own race preferences"
  ON public.race_user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own race preferences"
  ON public.race_user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own race preferences"
  ON public.race_user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger de updated_at (reutiliza função existente)
CREATE TRIGGER trg_race_user_preferences_updated_at
  BEFORE UPDATE ON public.race_user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_race_user_preferences_user
  ON public.race_user_preferences(user_id);