
CREATE TABLE public.race_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  track_type TEXT NOT NULL DEFAULT 'oval' CHECK (track_type IN ('oval','circuit','street')),
  goal_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','finished')),
  winner_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_race_seasons_status ON public.race_seasons(status);
ALTER TABLE public.race_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_race_seasons" ON public.race_seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_manage_race_seasons" ON public.race_seasons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_race_seasons_updated BEFORE UPDATE ON public.race_seasons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.race_cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL UNIQUE REFERENCES public.salespeople(id) ON DELETE CASCADE,
  car_number INT NOT NULL CHECK (car_number BETWEEN 1 AND 99),
  primary_color TEXT NOT NULL DEFAULT '#ef4444',
  secondary_color TEXT NOT NULL DEFAULT '#ffffff',
  car_style TEXT NOT NULL DEFAULT 'f1' CHECK (car_style IN ('f1','stock','kart')),
  nickname TEXT,
  total_races INT NOT NULL DEFAULT 0,
  total_wins INT NOT NULL DEFAULT 0,
  total_overtakes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.race_cars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_race_cars" ON public.race_cars FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own_car" ON public.race_cars FOR INSERT TO authenticated
  WITH CHECK (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()));
CREATE POLICY "update_own_car" ON public.race_cars FOR UPDATE TO authenticated
  USING (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()));
CREATE POLICY "admin_manage_cars" ON public.race_cars FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_race_cars_updated BEFORE UPDATE ON public.race_cars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.race_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.race_seasons(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('boost','overtake','checkpoint','powerup','victory','pitstop')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_race_events_season ON public.race_events(season_id, created_at DESC);
ALTER TABLE public.race_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_race_events" ON public.race_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_race_events" ON public.race_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE public.race_powerups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.race_seasons(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  powerup_type TEXT NOT NULL CHECK (powerup_type IN ('turbo','shield','lightning')),
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ,
  effect_data JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_race_powerups_sp ON public.race_powerups(season_id, salesperson_id);
ALTER TABLE public.race_powerups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_powerups" ON public.race_powerups FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_own_powerups" ON public.race_powerups FOR INSERT TO authenticated
  WITH CHECK (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()));
CREATE POLICY "update_own_powerups" ON public.race_powerups FOR UPDATE TO authenticated
  USING (salesperson_id IN (SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid()));

CREATE TABLE public.race_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  season_id UUID REFERENCES public.race_seasons(id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (salesperson_id, badge_code, season_id)
);
CREATE INDEX idx_race_badges_sp ON public.race_badges(salesperson_id);
ALTER TABLE public.race_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view_race_badges" ON public.race_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_race_badges" ON public.race_badges FOR INSERT TO authenticated WITH CHECK (true);

CREATE OR REPLACE VIEW public.race_leaderboard_view AS
SELECT
  rs.id AS season_id,
  rc.id AS car_id,
  rc.salesperson_id,
  sp.name AS salesperson_name,
  sp.avatar_url,
  rc.car_number,
  rc.primary_color,
  rc.secondary_color,
  rc.car_style,
  rc.nickname,
  COALESCE(SUM(s.amount), 0)::numeric AS total_sales,
  COUNT(s.id) AS deals_count,
  CASE WHEN rs.goal_amount > 0
    THEN LEAST(1, COALESCE(SUM(s.amount), 0) / rs.goal_amount)
    ELSE 0 END AS progress
FROM public.race_seasons rs
CROSS JOIN public.race_cars rc
JOIN public.salespeople sp ON sp.id = rc.salesperson_id
LEFT JOIN public.sales s
  ON s.salesperson_id = rc.salesperson_id
  AND s.status = 'completed'
  AND s.created_at::date BETWEEN rs.start_date AND rs.end_date
WHERE rs.status = 'active'
GROUP BY rs.id, rs.goal_amount, rc.id, sp.id;

ALTER PUBLICATION supabase_realtime ADD TABLE public.race_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_cars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_powerups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_seasons;
