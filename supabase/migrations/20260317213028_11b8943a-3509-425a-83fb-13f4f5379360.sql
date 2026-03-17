
-- 1. Collectible Badges definitions
CREATE TABLE public.collectible_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '🏅',
  category TEXT NOT NULL DEFAULT 'general',
  rarity TEXT NOT NULL DEFAULT 'common',
  unlock_condition TEXT NOT NULL,
  unlock_threshold INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collectible_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view badges" ON public.collectible_badges FOR SELECT TO authenticated USING (true);

-- 2. Salesperson earned badges
CREATE TABLE public.salesperson_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.collectible_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_showcase BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(salesperson_id, badge_id)
);

ALTER TABLE public.salesperson_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view earned badges" ON public.salesperson_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own badges" ON public.salesperson_badges FOR UPDATE TO authenticated USING (salesperson_id = public.get_current_salesperson_id());
CREATE POLICY "System can insert badges" ON public.salesperson_badges FOR INSERT TO authenticated WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 3. Progressive Goals
CREATE TABLE public.progressive_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL DEFAULT 'revenue',
  current_level INTEGER NOT NULL DEFAULT 1,
  current_target NUMERIC NOT NULL DEFAULT 10000,
  current_progress NUMERIC NOT NULL DEFAULT 0,
  multiplier NUMERIC NOT NULL DEFAULT 1.3,
  completed_levels INTEGER NOT NULL DEFAULT 0,
  total_xp_earned INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id, goal_type)
);

ALTER TABLE public.progressive_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view goals" ON public.progressive_goals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own goals" ON public.progressive_goals FOR UPDATE TO authenticated USING (salesperson_id = public.get_current_salesperson_id());
CREATE POLICY "Users can insert own goals" ON public.progressive_goals FOR INSERT TO authenticated WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 4. Competitive Chat Messages
CREATE TABLE public.competitive_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'chat',
  target_salesperson_id UUID REFERENCES public.salespeople(id),
  matchup_id UUID REFERENCES public.weekly_matchups(id),
  reactions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.competitive_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view chat" ON public.competitive_chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can send messages" ON public.competitive_chat_messages FOR INSERT TO authenticated WITH CHECK (salesperson_id = public.get_current_salesperson_id());
CREATE POLICY "Users can update own messages" ON public.competitive_chat_messages FOR UPDATE TO authenticated USING (salesperson_id = public.get_current_salesperson_id());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.competitive_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.salesperson_badges;

-- Seed some badges
INSERT INTO public.collectible_badges (name, description, icon, category, rarity, unlock_condition, unlock_threshold, xp_reward) VALUES
('Primeiro Sangue', 'Feche sua primeira venda', '🩸', 'vendas', 'common', 'first_sale', 1, 50),
('Máquina de Vendas', 'Feche 10 vendas em um mês', '⚙️', 'vendas', 'rare', 'monthly_sales', 10, 150),
('Streak de Fogo', 'Mantenha um streak de 5 dias', '🔥', 'streak', 'rare', 'streak_days', 5, 200),
('Imbatível', 'Mantenha um streak de 10 dias', '💎', 'streak', 'epic', 'streak_days', 10, 500),
('Rei do Mês', 'Termine em #1 no ranking mensal', '👑', 'ranking', 'legendary', 'monthly_rank_1', 1, 1000),
('Top 3', 'Termine no top 3 do ranking mensal', '🥇', 'ranking', 'epic', 'monthly_top_3', 1, 300),
('Gladiador', 'Vença 5 duelos 1v1', '⚔️', 'duelos', 'rare', 'h2h_wins', 5, 250),
('Campeão de Liga', 'Alcance a liga Diamante', '💠', 'ligas', 'legendary', 'diamond_league', 1, 1500),
('Missão Cumprida', 'Complete 20 missões diárias', '✅', 'missoes', 'rare', 'daily_missions', 20, 200),
('Sortudo', 'Ganhe 10 prêmios na roda', '🎰', 'roda', 'common', 'wheel_prizes', 10, 100),
('Social Butterfly', 'Reaja a 50 vitórias no feed', '🦋', 'social', 'rare', 'feed_reactions', 50, 150),
('Veterano', 'Esteja ativo por 30 dias consecutivos', '🎖️', 'streak', 'epic', 'active_days', 30, 800);
