
-- Combo tracking table
CREATE TABLE public.combo_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  combo_date DATE NOT NULL DEFAULT CURRENT_DATE,
  actions_count INTEGER NOT NULL DEFAULT 0,
  current_multiplier NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  current_tier INTEGER NOT NULL DEFAULT 0,
  max_tier_today INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id, combo_date)
);

-- Leagues table
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 1,
  icon TEXT NOT NULL DEFAULT '🥉',
  color TEXT NOT NULL DEFAULT '#94a3b8',
  min_xp INTEGER NOT NULL DEFAULT 0,
  xp_bonus_percent INTEGER NOT NULL DEFAULT 0,
  promotion_slots INTEGER NOT NULL DEFAULT 3,
  demotion_slots INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- League members table
CREATE TABLE public.league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id)
);

-- Insert default leagues
INSERT INTO public.leagues (name, tier, icon, color, min_xp, xp_bonus_percent, promotion_slots, demotion_slots) VALUES
  ('Bronze', 1, '🥉', '#CD7F32', 0, 0, 3, 0),
  ('Prata', 2, '🥈', '#C0C0C0', 100, 5, 3, 3),
  ('Ouro', 3, '🥇', '#FFD700', 300, 10, 3, 3),
  ('Diamante', 4, '💎', '#B9F2FF', 600, 15, 3, 3),
  ('Lendário', 5, '👑', '#FF6B35', 1000, 25, 0, 3);

-- Enable RLS
ALTER TABLE public.combo_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- RLS policies - combo_tracking
CREATE POLICY "Anyone can read combo_tracking" ON public.combo_tracking FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert combo_tracking" ON public.combo_tracking FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update combo_tracking" ON public.combo_tracking FOR UPDATE TO authenticated USING (true);

-- RLS policies - leagues
CREATE POLICY "Anyone can read leagues" ON public.leagues FOR SELECT TO authenticated USING (true);

-- RLS policies - league_members
CREATE POLICY "Anyone can read league_members" ON public.league_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert league_members" ON public.league_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update league_members" ON public.league_members FOR UPDATE TO authenticated USING (true);

-- Enable realtime for league_members
ALTER PUBLICATION supabase_realtime ADD TABLE public.league_members;
