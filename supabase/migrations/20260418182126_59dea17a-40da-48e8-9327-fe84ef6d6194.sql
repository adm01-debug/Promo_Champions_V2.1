-- Snapshot diário do leaderboard para calcular deltas vs ontem
CREATE TABLE IF NOT EXISTS public.race_daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.race_seasons(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  rank INTEGER NOT NULL,
  progress NUMERIC NOT NULL DEFAULT 0,
  total_sales NUMERIC NOT NULL DEFAULT 0,
  deals_count INTEGER NOT NULL DEFAULT 0,
  score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (season_id, salesperson_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_race_daily_snapshots_lookup
  ON public.race_daily_snapshots (salesperson_id, season_id, snapshot_date DESC);

ALTER TABLE public.race_daily_snapshots ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler (leaderboard é público no app)
CREATE POLICY "race_daily_snapshots_select_authenticated"
  ON public.race_daily_snapshots FOR SELECT
  TO authenticated USING (true);

-- Apenas admins gerenciam manualmente; insert acontece via RPC SECURITY DEFINER
CREATE POLICY "race_daily_snapshots_admin_manage"
  ON public.race_daily_snapshots FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Track do último check-in diário visto pelo usuário
CREATE TABLE IF NOT EXISTS public.race_user_daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.race_seasons(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
  streak_days INTEGER NOT NULL DEFAULT 1,
  reward_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, season_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_race_user_daily_checkins_user
  ON public.race_user_daily_checkins (user_id, season_id, checkin_date DESC);

ALTER TABLE public.race_user_daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "race_user_daily_checkins_own_select"
  ON public.race_user_daily_checkins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "race_user_daily_checkins_own_insert"
  ON public.race_user_daily_checkins FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- RPC: faz snapshot do leaderboard atual (idempotente para o dia)
CREATE OR REPLACE FUNCTION public.snapshot_race_daily(_season_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INTEGER := 0;
  today_br DATE := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  INSERT INTO public.race_daily_snapshots (
    season_id, salesperson_id, snapshot_date, rank, progress, total_sales, deals_count, score
  )
  SELECT
    v.season_id,
    v.salesperson_id,
    today_br,
    ROW_NUMBER() OVER (ORDER BY v.progress DESC)::INTEGER AS rank,
    v.progress,
    COALESCE(v.total_sales, 0),
    COALESCE(v.deals_count, 0),
    v.score
  FROM public.race_leaderboard_view v
  WHERE v.season_id = _season_id
  ON CONFLICT (season_id, salesperson_id, snapshot_date) DO UPDATE
    SET rank = EXCLUDED.rank,
        progress = EXCLUDED.progress,
        total_sales = EXCLUDED.total_sales,
        deals_count = EXCLUDED.deals_count,
        score = EXCLUDED.score;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.snapshot_race_daily(UUID) TO authenticated;

-- RPC: registra check-in diário do usuário, calcula streak, retorna delta vs último snapshot
CREATE OR REPLACE FUNCTION public.register_race_daily_checkin(_season_id UUID, _salesperson_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_br DATE := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  yesterday_br DATE := today_br - INTERVAL '1 day';
  prev_streak INTEGER := 0;
  new_streak INTEGER := 1;
  today_snap RECORD;
  prev_snap RECORD;
  result JSONB;
  already_checked_in BOOLEAN;
BEGIN
  -- Garante snapshot de hoje
  PERFORM public.snapshot_race_daily(_season_id);

  -- Já fez check-in hoje?
  SELECT EXISTS (
    SELECT 1 FROM public.race_user_daily_checkins
    WHERE user_id = auth.uid() AND season_id = _season_id AND checkin_date = today_br
  ) INTO already_checked_in;

  -- Pega streak anterior (do dia de ontem)
  SELECT streak_days INTO prev_streak
  FROM public.race_user_daily_checkins
  WHERE user_id = auth.uid() AND season_id = _season_id AND checkin_date = yesterday_br
  LIMIT 1;

  IF prev_streak IS NULL THEN prev_streak := 0; END IF;
  new_streak := prev_streak + 1;

  -- Insere check-in (idempotente)
  INSERT INTO public.race_user_daily_checkins (user_id, season_id, streak_days)
  VALUES (auth.uid(), _season_id, new_streak)
  ON CONFLICT (user_id, season_id, checkin_date) DO UPDATE SET streak_days = EXCLUDED.streak_days;

  -- Pega snapshots
  SELECT * INTO today_snap FROM public.race_daily_snapshots
  WHERE season_id = _season_id AND salesperson_id = _salesperson_id AND snapshot_date = today_br
  LIMIT 1;

  SELECT * INTO prev_snap FROM public.race_daily_snapshots
  WHERE season_id = _season_id AND salesperson_id = _salesperson_id AND snapshot_date < today_br
  ORDER BY snapshot_date DESC
  LIMIT 1;

  result := jsonb_build_object(
    'already_checked_in_today', already_checked_in,
    'streak_days', new_streak,
    'previous_streak', prev_streak,
    'today', CASE WHEN today_snap IS NOT NULL THEN jsonb_build_object(
      'rank', today_snap.rank,
      'progress', today_snap.progress,
      'total_sales', today_snap.total_sales,
      'deals_count', today_snap.deals_count
    ) ELSE NULL END,
    'previous', CASE WHEN prev_snap IS NOT NULL THEN jsonb_build_object(
      'date', prev_snap.snapshot_date,
      'rank', prev_snap.rank,
      'progress', prev_snap.progress,
      'total_sales', prev_snap.total_sales,
      'deals_count', prev_snap.deals_count
    ) ELSE NULL END,
    'delta', CASE WHEN today_snap IS NOT NULL AND prev_snap IS NOT NULL THEN jsonb_build_object(
      'rank', prev_snap.rank - today_snap.rank,
      'progress', today_snap.progress - prev_snap.progress,
      'total_sales', today_snap.total_sales - prev_snap.total_sales,
      'deals_count', today_snap.deals_count - prev_snap.deals_count
    ) ELSE NULL END
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_race_daily_checkin(UUID, UUID) TO authenticated;