CREATE TABLE IF NOT EXISTS public.race_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid,
  target_car_id uuid NOT NULL,
  reactor_user_id uuid NOT NULL,
  emoji text NOT NULL CHECK (char_length(emoji) BETWEEN 1 AND 8),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_race_reactions_target_created
  ON public.race_reactions(target_car_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_race_reactions_season
  ON public.race_reactions(season_id, created_at DESC);

ALTER TABLE public.race_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reactions readable by authenticated" ON public.race_reactions;
CREATE POLICY "Reactions readable by authenticated"
  ON public.race_reactions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users insert own reactions" ON public.race_reactions;
CREATE POLICY "Users insert own reactions"
  ON public.race_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reactor_user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.race_reactions;
ALTER TABLE public.race_reactions REPLICA IDENTITY FULL;