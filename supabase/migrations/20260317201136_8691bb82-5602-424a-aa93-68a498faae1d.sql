
-- Victory Feed: posts de vitórias e conquistas
CREATE TABLE public.victory_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'sale', -- sale, achievement, record, streak, challenge
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reações no feed
CREATE TABLE public.feed_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_item_id UUID REFERENCES public.victory_feed(id) ON DELETE CASCADE NOT NULL,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  reaction TEXT NOT NULL DEFAULT '🔥', -- 🔥👏🚀💪🏆
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(feed_item_id, salesperson_id)
);

-- Comentários no feed
CREATE TABLE public.feed_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feed_item_id UUID REFERENCES public.victory_feed(id) ON DELETE CASCADE NOT NULL,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Duelos / Batalhas
CREATE TABLE public.sales_battles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  battle_type TEXT NOT NULL DEFAULT '1v1', -- 1v1, team
  metric TEXT NOT NULL DEFAULT 'calls', -- calls, emails, meetings, revenue, deals
  target_value INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  winner_id UUID REFERENCES public.salespeople(id),
  xp_reward INTEGER NOT NULL DEFAULT 100,
  created_by UUID REFERENCES public.salespeople(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Participantes das batalhas
CREATE TABLE public.battle_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID REFERENCES public.sales_battles(id) ON DELETE CASCADE NOT NULL,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT, -- for team battles
  current_score INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(battle_id, salesperson_id)
);

-- Temporadas competitivas
CREATE TABLE public.competitive_seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  season_number INTEGER NOT NULL DEFAULT 1,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- upcoming, active, completed
  xp_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Power-ups ativos
CREATE TABLE public.active_power_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE NOT NULL,
  power_up_type TEXT NOT NULL, -- xp_boost, streak_shield, double_points
  multiplier NUMERIC NOT NULL DEFAULT 2.0,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  source TEXT DEFAULT 'streak', -- streak, challenge, battle, admin
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.victory_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_power_ups ENABLE ROW LEVEL SECURITY;

-- RLS Policies: authenticated users can read all, insert own
CREATE POLICY "Authenticated can read victory_feed" ON public.victory_feed FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert victory_feed" ON public.victory_feed FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can read feed_reactions" ON public.feed_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage own reactions" ON public.feed_reactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete own reactions" ON public.feed_reactions FOR DELETE TO authenticated USING (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Authenticated can read feed_comments" ON public.feed_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert feed_comments" ON public.feed_comments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can read sales_battles" ON public.sales_battles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage battles" ON public.sales_battles FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Authenticated can read battle_participants" ON public.battle_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can join battles" ON public.battle_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update participants" ON public.battle_participants FOR UPDATE TO authenticated USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Authenticated can read seasons" ON public.competitive_seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage seasons" ON public.competitive_seasons FOR ALL TO authenticated USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Authenticated can read power_ups" ON public.active_power_ups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert power_ups" ON public.active_power_ups FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for victory feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.victory_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battle_participants;
