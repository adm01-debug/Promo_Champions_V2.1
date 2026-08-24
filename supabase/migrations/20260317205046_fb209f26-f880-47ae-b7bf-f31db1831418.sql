
-- 1. League system
CREATE TYPE public.sales_league AS ENUM ('bronze', 'silver', 'gold', 'diamond');

CREATE TABLE public.salesperson_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  league sales_league NOT NULL DEFAULT 'bronze',
  season_number INTEGER NOT NULL DEFAULT 1,
  promoted_at TIMESTAMPTZ,
  demoted_at TIMESTAMPTZ,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id, season_number)
);

ALTER TABLE public.salesperson_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read leagues" ON public.salesperson_leagues FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage leagues" ON public.salesperson_leagues FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- 2. Sales streaks
CREATE TABLE public.sales_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_sale_date DATE,
  xp_multiplier NUMERIC(3,1) NOT NULL DEFAULT 1.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sales_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read streaks" ON public.sales_streaks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own streaks update" ON public.sales_streaks FOR UPDATE TO authenticated USING (salesperson_id = public.get_current_salesperson_id());
CREATE POLICY "Insert own streak" ON public.sales_streaks FOR INSERT TO authenticated WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 3. Weekly matchups (head-to-head)
CREATE TABLE public.weekly_matchups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_a_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  salesperson_b_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  score_a NUMERIC NOT NULL DEFAULT 0,
  score_b NUMERIC NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.salespeople(id),
  status TEXT NOT NULL DEFAULT 'active',
  xp_reward INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_matchups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read matchups" ON public.weekly_matchups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage matchups" ON public.weekly_matchups FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

-- 4. Prize wheel spins
CREATE TABLE public.prize_wheel_spins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  prize_type TEXT NOT NULL,
  prize_value INTEGER NOT NULL DEFAULT 0,
  prize_label TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'mission',
  spun_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prize_wheel_spins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read spins" ON public.prize_wheel_spins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert own spins" ON public.prize_wheel_spins FOR INSERT TO authenticated WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 5. Available spins (earned but not used)
CREATE TABLE public.available_spins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  spins_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id)
);

ALTER TABLE public.available_spins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read available spins" ON public.available_spins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own spins manage" ON public.available_spins FOR ALL TO authenticated USING (salesperson_id = public.get_current_salesperson_id());
