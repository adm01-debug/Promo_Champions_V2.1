-- 1. Adicionar colunas de personalização avançada em race_cars
ALTER TABLE public.race_cars
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS victory_quote text;

-- 2. Tabela de desbloqueios
CREATE TABLE IF NOT EXISTS public.race_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  unlock_key text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT race_unlocks_user_key_unique UNIQUE (user_id, unlock_key)
);

CREATE INDEX IF NOT EXISTS idx_race_unlocks_user ON public.race_unlocks(user_id);

ALTER TABLE public.race_unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own unlocks" ON public.race_unlocks;
CREATE POLICY "Users view own unlocks"
  ON public.race_unlocks FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users insert own unlocks" ON public.race_unlocks;
CREATE POLICY "Users insert own unlocks"
  ON public.race_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. RPC server-side validada
CREATE OR REPLACE FUNCTION public.unlock_race_item(_unlock_key text, _required_league text DEFAULT 'bronze')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _user_league text;
  _league_order int;
  _required_order int;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthenticated');
  END IF;

  -- Mapeia liga atual (fallback bronze)
  SELECT COALESCE(current_league, 'bronze') INTO _user_league
  FROM public.arena_user_stats WHERE user_id = _user_id LIMIT 1;
  _user_league := COALESCE(_user_league, 'bronze');

  _league_order := CASE _user_league
    WHEN 'bronze' THEN 1 WHEN 'prata' THEN 2 WHEN 'ouro' THEN 3
    WHEN 'platina' THEN 4 WHEN 'diamante' THEN 5 ELSE 1 END;
  _required_order := CASE _required_league
    WHEN 'bronze' THEN 1 WHEN 'prata' THEN 2 WHEN 'ouro' THEN 3
    WHEN 'platina' THEN 4 WHEN 'diamante' THEN 5 ELSE 1 END;

  IF _league_order < _required_order THEN
    RETURN jsonb_build_object(
      'success', false, 'error', 'league_required',
      'current_league', _user_league, 'required_league', _required_league
    );
  END IF;

  INSERT INTO public.race_unlocks (user_id, unlock_key)
  VALUES (_user_id, _unlock_key)
  ON CONFLICT (user_id, unlock_key) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'unlock_key', _unlock_key);
END;
$$;