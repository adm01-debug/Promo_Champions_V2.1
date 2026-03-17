
-- =====================================================
-- SECURITY FIX: Remaining permissive policies (batch 3 - fixed)
-- =====================================================

-- 1. FIX: salesperson_xp - restrict to own
DROP POLICY IF EXISTS "Authenticated users can insert salesperson_xp" ON public.salesperson_xp;
DROP POLICY IF EXISTS "Authenticated users can update salesperson_xp" ON public.salesperson_xp;

CREATE POLICY "Users can insert own salesperson_xp"
  ON public.salesperson_xp FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own salesperson_xp"
  ON public.salesperson_xp FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id());

-- 2. FIX: xp_history - restrict to own
DROP POLICY IF EXISTS "Authenticated users can insert xp_history" ON public.xp_history;

CREATE POLICY "Users can insert own xp_history"
  ON public.xp_history FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 3. FIX: playbook_progress - restrict to own (uses completed_by, not salesperson_id)
DROP POLICY IF EXISTS "Authenticated users can insert playbook_progress" ON public.playbook_progress;
DROP POLICY IF EXISTS "Authenticated users can update playbook_progress" ON public.playbook_progress;
DROP POLICY IF EXISTS "Authenticated users can delete playbook_progress" ON public.playbook_progress;

CREATE POLICY "Users can insert own playbook_progress"
  ON public.playbook_progress FOR INSERT TO authenticated
  WITH CHECK (completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can update own playbook_progress"
  ON public.playbook_progress FOR UPDATE TO authenticated
  USING (completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own playbook_progress"
  ON public.playbook_progress FOR DELETE TO authenticated
  USING (completed_by = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

-- 4. FIX: prospect_cadences - restrict to own
DROP POLICY IF EXISTS "Authenticated users can insert prospect_cadences" ON public.prospect_cadences;
DROP POLICY IF EXISTS "Authenticated users can update prospect_cadences" ON public.prospect_cadences;
DROP POLICY IF EXISTS "Authenticated users can delete prospect_cadences" ON public.prospect_cadences;

CREATE POLICY "Users can insert own prospect_cadences"
  ON public.prospect_cadences FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can update own prospect_cadences"
  ON public.prospect_cadences FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can delete own prospect_cadences"
  ON public.prospect_cadences FOR DELETE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

-- 5. FIX: notification_preferences - restrict to own email
DROP POLICY IF EXISTS "Authenticated users can insert notification_preferences" ON public.notification_preferences;

CREATE POLICY "Users can insert own notification_preferences"
  ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK (email = public.get_current_user_email());

-- 6. FIX: performance_bets - restrict to own (uses salesperson_id)
DROP POLICY IF EXISTS "Auth users can insert bets" ON public.performance_bets;
DROP POLICY IF EXISTS "Auth users can update bets" ON public.performance_bets;

CREATE POLICY "Users can insert own bets"
  ON public.performance_bets FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own bets"
  ON public.performance_bets FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id());

-- 7. FIX: battle_participants - restrict to own
DROP POLICY IF EXISTS "Authenticated can join battles" ON public.battle_participants;

CREATE POLICY "Users can join battles as self"
  ON public.battle_participants FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 8. FIX: feed_comments - restrict insert to own
DROP POLICY IF EXISTS "Authenticated can insert feed_comments" ON public.feed_comments;

CREATE POLICY "Users can insert own feed_comments"
  ON public.feed_comments FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 9. FIX: feed_reactions - restrict insert to own
DROP POLICY IF EXISTS "Authenticated can manage own reactions" ON public.feed_reactions;

CREATE POLICY "Users can insert own feed_reactions"
  ON public.feed_reactions FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 10. FIX: sales_territories - restrict to admin
DROP POLICY IF EXISTS "Auth users can insert territories" ON public.sales_territories;
DROP POLICY IF EXISTS "Auth users can update territories" ON public.sales_territories;

CREATE POLICY "Admins can insert territories"
  ON public.sales_territories FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update territories"
  ON public.sales_territories FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 11. FIX: tournaments - restrict to admin
DROP POLICY IF EXISTS "Auth users can insert tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Auth users can update tournaments" ON public.tournaments;

CREATE POLICY "Admins can insert tournaments"
  ON public.tournaments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update tournaments"
  ON public.tournaments FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 12. FIX: tournament_matches - restrict to admin
DROP POLICY IF EXISTS "Auth users can insert matches" ON public.tournament_matches;
DROP POLICY IF EXISTS "Auth users can update matches" ON public.tournament_matches;

CREATE POLICY "Admins can insert matches"
  ON public.tournament_matches FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update matches"
  ON public.tournament_matches FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 13. FIX: tournament_participants - restrict to own or admin
DROP POLICY IF EXISTS "Auth users can insert participants" ON public.tournament_participants;
DROP POLICY IF EXISTS "Auth users can update participants" ON public.tournament_participants;

CREATE POLICY "Users can insert own tournament_participants"
  ON public.tournament_participants FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can update own tournament_participants"
  ON public.tournament_participants FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

-- 14. FIX: territory_history - restrict to admin
DROP POLICY IF EXISTS "Auth users can insert territory history" ON public.territory_history;

CREATE POLICY "Admins can insert territory_history"
  ON public.territory_history FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 15. FIX: salespeople INSERT - restrict to admin only
DROP POLICY IF EXISTS "Authenticated users can insert salespeople" ON public.salespeople;

CREATE POLICY "Admins can insert salespeople"
  ON public.salespeople FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 16. FIX: lead_routing_log - restrict to admin (was public role!)
DROP POLICY IF EXISTS "Authenticated users can insert lead_routing_log" ON public.lead_routing_log;

CREATE POLICY "Admins can insert lead_routing_log"
  ON public.lead_routing_log FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- 17. FIX: rank_change_notifications - restrict to own
DROP POLICY IF EXISTS "System can insert rank notifications" ON public.rank_change_notifications;

CREATE POLICY "Users can insert own rank_notifications"
  ON public.rank_change_notifications FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());
