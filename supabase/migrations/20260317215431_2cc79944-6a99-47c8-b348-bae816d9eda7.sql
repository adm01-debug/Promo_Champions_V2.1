
-- Tournaments (Elimination Brackets)
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  bracket_type TEXT NOT NULL DEFAULT 'single_elimination' CHECK (bracket_type IN ('single_elimination', 'double_elimination')),
  metric_type TEXT NOT NULL DEFAULT 'revenue' CHECK (metric_type IN ('revenue', 'deals', 'activities', 'conversion')),
  round_duration_days INTEGER NOT NULL DEFAULT 7,
  current_round INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL DEFAULT 3,
  xp_reward INTEGER NOT NULL DEFAULT 500,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.salespeople(id)
);

CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  seed INTEGER,
  is_eliminated BOOLEAN NOT NULL DEFAULT false,
  eliminated_in_round INTEGER,
  final_position INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, salesperson_id)
);

CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  match_order INTEGER NOT NULL DEFAULT 0,
  player1_id UUID REFERENCES public.salespeople(id),
  player2_id UUID REFERENCES public.salespeople(id),
  player1_score NUMERIC NOT NULL DEFAULT 0,
  player2_score NUMERIC NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.salespeople(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Bets
CREATE TABLE public.performance_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('deals', 'revenue', 'calls', 'meetings', 'activities')),
  target_value NUMERIC NOT NULL,
  xp_wagered INTEGER NOT NULL DEFAULT 100,
  xp_multiplier NUMERIC NOT NULL DEFAULT 2.0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'won', 'lost', 'cancelled')),
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Territory Wars
CREATE TABLE public.sales_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_name TEXT NOT NULL,
  territory_type TEXT NOT NULL DEFAULT 'segment' CHECK (territory_type IN ('segment', 'region', 'product', 'niche')),
  current_owner_id UUID REFERENCES public.salespeople(id),
  total_revenue NUMERIC NOT NULL DEFAULT 0,
  total_deals INTEGER NOT NULL DEFAULT 0,
  conquered_at TIMESTAMPTZ,
  is_contested BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.territory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  territory_id UUID REFERENCES public.sales_territories(id) ON DELETE CASCADE NOT NULL,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  revenue_contribution NUMERIC NOT NULL DEFAULT 0,
  deals_count INTEGER NOT NULL DEFAULT 0,
  conquered_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territory_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - authenticated read/write
CREATE POLICY "Auth users can read tournaments" ON public.tournaments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert tournaments" ON public.tournaments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update tournaments" ON public.tournaments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read participants" ON public.tournament_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert participants" ON public.tournament_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update participants" ON public.tournament_participants FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read matches" ON public.tournament_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert matches" ON public.tournament_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update matches" ON public.tournament_matches FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read bets" ON public.performance_bets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert bets" ON public.performance_bets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update bets" ON public.performance_bets FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read territories" ON public.sales_territories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert territories" ON public.sales_territories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth users can update territories" ON public.sales_territories FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Auth users can read territory history" ON public.territory_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users can insert territory history" ON public.territory_history FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for competitive features
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_bets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_territories;
