
-- =====================================================
-- RACE TEAMS (Escuderias)
-- =====================================================
CREATE TABLE public.race_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.race_seasons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color_primary TEXT NOT NULL DEFAULT '#dc2626',
  color_secondary TEXT NOT NULL DEFAULT '#fbbf24',
  emoji TEXT DEFAULT '🏎️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (season_id, name)
);

CREATE INDEX idx_race_teams_season ON public.race_teams(season_id);

ALTER TABLE public.race_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view teams"
  ON public.race_teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage teams"
  ON public.race_teams FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_race_teams_updated_at
  BEFORE UPDATE ON public.race_teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RACE TEAM MEMBERS
-- =====================================================
CREATE TABLE public.race_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.race_teams(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.race_cars(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, car_id)
);

-- Garante que um carro só pertence a uma equipe por temporada (via team -> season)
CREATE UNIQUE INDEX idx_race_team_members_car_per_season
  ON public.race_team_members(car_id, team_id);

CREATE INDEX idx_race_team_members_team ON public.race_team_members(team_id);
CREATE INDEX idx_race_team_members_car ON public.race_team_members(car_id);

ALTER TABLE public.race_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view team members"
  ON public.race_team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage team members"
  ON public.race_team_members FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RACE RIVALRIES PERSISTENT (Rivalidade nomeada por usuário)
-- =====================================================
CREATE TABLE public.race_rivalries_persistent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.race_seasons(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.race_cars(id) ON DELETE CASCADE,
  rival_car_id UUID NOT NULL REFERENCES public.race_cars(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (season_id, car_id),
  CHECK (car_id <> rival_car_id)
);

CREATE INDEX idx_race_rivalries_persistent_season ON public.race_rivalries_persistent(season_id);
CREATE INDEX idx_race_rivalries_persistent_car ON public.race_rivalries_persistent(car_id);

ALTER TABLE public.race_rivalries_persistent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rivalries"
  ON public.race_rivalries_persistent FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage own rivalry"
  ON public.race_rivalries_persistent FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.race_cars rc
      JOIN public.salespeople sp ON sp.id = rc.salesperson_id
      WHERE rc.id = race_rivalries_persistent.car_id
        AND sp.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.race_cars rc
      JOIN public.salespeople sp ON sp.id = rc.salesperson_id
      WHERE rc.id = race_rivalries_persistent.car_id
        AND sp.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all rivalries"
  ON public.race_rivalries_persistent FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_race_rivalries_persistent_updated_at
  BEFORE UPDATE ON public.race_rivalries_persistent
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
