-- Move extensions to extensions schema
ALTER EXTENSION vector SET SCHEMA extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Update RLS policies to require authentication instead of "true" (public)
-- win_loss_insight_comments
DROP POLICY IF EXISTS "auth read comments" ON public.win_loss_insight_comments;
CREATE POLICY "auth read comments" ON public.win_loss_insight_comments FOR SELECT USING (auth.uid() IS NOT NULL);

-- win_loss_insights
DROP POLICY IF EXISTS "wli read auth" ON public.win_loss_insights;
CREATE POLICY "wli read auth" ON public.win_loss_insights FOR SELECT USING (auth.uid() IS NOT NULL);

-- automation_workflows
DROP POLICY IF EXISTS "Authenticated users can view active workflows" ON public.automation_workflows;
CREATE POLICY "Authenticated users can view active workflows" ON public.automation_workflows FOR SELECT USING (auth.uid() IS NOT NULL);

-- collectible_badges
DROP POLICY IF EXISTS "Anyone authenticated can view badges" ON public.collectible_badges;
CREATE POLICY "Anyone authenticated can view badges" ON public.collectible_badges FOR SELECT USING (auth.uid() IS NOT NULL);

-- task_catalog
DROP POLICY IF EXISTS "Anyone authenticated can view catalog" ON public.task_catalog;
CREATE POLICY "Anyone authenticated can view catalog" ON public.task_catalog FOR SELECT USING (auth.uid() IS NOT NULL);

-- competitors_registry
DROP POLICY IF EXISTS "Anyone authenticated can view competitors" ON public.competitors_registry;
CREATE POLICY "Anyone authenticated can view competitors" ON public.competitors_registry FOR SELECT USING (auth.uid() IS NOT NULL);

-- victory_feed
DROP POLICY IF EXISTS "Authenticated can read victory_feed" ON public.victory_feed;
CREATE POLICY "Authenticated can read victory_feed" ON public.victory_feed FOR SELECT USING (auth.uid() IS NOT NULL);

-- competitive_seasons
DROP POLICY IF EXISTS "Authenticated can read seasons" ON public.competitive_seasons;
CREATE POLICY "Authenticated can read seasons" ON public.competitive_seasons FOR SELECT USING (auth.uid() IS NOT NULL);

-- feedback_reactions
DROP POLICY IF EXISTS "Authenticated can read feed_reactions" ON public.feed_reactions;
CREATE POLICY "Authenticated can read feed_reactions" ON public.feed_reactions FOR SELECT USING (auth.uid() IS NOT NULL);

-- feed_comments
DROP POLICY IF EXISTS "Authenticated can read feed_comments" ON public.feed_comments;
CREATE POLICY "Authenticated can read feed_comments" ON public.feed_comments FOR SELECT USING (auth.uid() IS NOT NULL);

-- sales_battles
DROP POLICY IF EXISTS "Authenticated can read sales_battles" ON public.sales_battles;
CREATE POLICY "Authenticated can read sales_battles" ON public.sales_battles FOR SELECT USING (auth.uid() IS NOT NULL);

-- battle_participants
DROP POLICY IF EXISTS "Authenticated can read battle_participants" ON public.battle_participants;
CREATE POLICY "Authenticated can read battle_participants" ON public.battle_participants FOR SELECT USING (auth.uid() IS NOT NULL);
