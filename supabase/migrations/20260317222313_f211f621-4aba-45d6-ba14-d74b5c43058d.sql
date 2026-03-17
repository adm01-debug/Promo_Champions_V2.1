
-- =====================================================
-- SECURITY FIX: Replace permissive "true" INSERT/UPDATE/DELETE
-- policies with ownership-based checks
-- =====================================================

-- 1. FIX: activity_goals - restrict to own salesperson
DROP POLICY IF EXISTS "Authenticated users can insert activity_goals" ON public.activity_goals;
DROP POLICY IF EXISTS "Authenticated users can update activity_goals" ON public.activity_goals;
DROP POLICY IF EXISTS "Authenticated users can delete activity_goals" ON public.activity_goals;

CREATE POLICY "Users can insert own activity_goals"
  ON public.activity_goals FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own activity_goals"
  ON public.activity_goals FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete activity_goals"
  ON public.activity_goals FOR DELETE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 2. FIX: achievements - restrict insert to own
DROP POLICY IF EXISTS "Authenticated users can insert achievements" ON public.achievements;

CREATE POLICY "Users can insert own achievements"
  ON public.achievements FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 3. FIX: active_power_ups - restrict insert to own
DROP POLICY IF EXISTS "Authenticated can insert power_ups" ON public.active_power_ups;

CREATE POLICY "Users can insert own power_ups"
  ON public.active_power_ups FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

-- 4. FIX: challenge_progress - restrict to own (was public role!)
DROP POLICY IF EXISTS "Authenticated users can insert challenge_progress" ON public.challenge_progress;
DROP POLICY IF EXISTS "Authenticated users can update challenge_progress" ON public.challenge_progress;

CREATE POLICY "Users can insert own challenge_progress"
  ON public.challenge_progress FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own challenge_progress"
  ON public.challenge_progress FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id());

-- 5. FIX: daily_challenge_progress - restrict to own (was public role!)
DROP POLICY IF EXISTS "Authenticated users can insert daily_challenge_progress" ON public.daily_challenge_progress;
DROP POLICY IF EXISTS "Authenticated users can update daily_challenge_progress" ON public.daily_challenge_progress;

CREATE POLICY "Users can insert own daily_challenge_progress"
  ON public.daily_challenge_progress FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own daily_challenge_progress"
  ON public.daily_challenge_progress FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id());

-- 6. FIX: daily_streak_achievements - restrict to own (was public role!)
DROP POLICY IF EXISTS "Authenticated users can insert daily_streak_achievements" ON public.daily_streak_achievements;
DROP POLICY IF EXISTS "Authenticated users can update daily_streak_achievements" ON public.daily_streak_achievements;

CREATE POLICY "Users can insert own daily_streak_achievements"
  ON public.daily_streak_achievements FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own daily_streak_achievements"
  ON public.daily_streak_achievements FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id());

-- 7. FIX: deal_stage_history - restrict to own deals
DROP POLICY IF EXISTS "Authenticated users can insert deal_stage_history" ON public.deal_stage_history;
DROP POLICY IF EXISTS "Authenticated users can update deal_stage_history" ON public.deal_stage_history;

CREATE POLICY "Users can insert own deal_stage_history"
  ON public.deal_stage_history FOR INSERT TO authenticated
  WITH CHECK (
    sale_id IN (
      SELECT id FROM public.sales WHERE salesperson_id = public.get_current_salesperson_id()
    ) OR public.is_admin_or_manager(auth.uid())
  );

CREATE POLICY "Users can update own deal_stage_history"
  ON public.deal_stage_history FOR UPDATE TO authenticated
  USING (
    sale_id IN (
      SELECT id FROM public.sales WHERE salesperson_id = public.get_current_salesperson_id()
    ) OR public.is_admin_or_manager(auth.uid())
  );

-- 8. FIX: cadence_tasks - restrict to own
DROP POLICY IF EXISTS "Authenticated users can insert cadence_tasks" ON public.cadence_tasks;
DROP POLICY IF EXISTS "Authenticated users can update cadence_tasks" ON public.cadence_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete cadence_tasks" ON public.cadence_tasks;

CREATE POLICY "Users can insert own cadence_tasks"
  ON public.cadence_tasks FOR INSERT TO authenticated
  WITH CHECK (
    prospect_cadence_id IN (
      SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id()
    ) OR public.is_admin_or_manager(auth.uid())
  );

CREATE POLICY "Users can update own cadence_tasks"
  ON public.cadence_tasks FOR UPDATE TO authenticated
  USING (
    prospect_cadence_id IN (
      SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id()
    ) OR public.is_admin_or_manager(auth.uid())
  );

CREATE POLICY "Users can delete own cadence_tasks"
  ON public.cadence_tasks FOR DELETE TO authenticated
  USING (
    prospect_cadence_id IN (
      SELECT id FROM public.prospect_cadences WHERE salesperson_id = public.get_current_salesperson_id()
    ) OR public.is_admin_or_manager(auth.uid())
  );

-- 9. FIX: icp_data - restrict to admin/manager (was public role!)
DROP POLICY IF EXISTS "Authenticated users can insert icp_data" ON public.icp_data;
DROP POLICY IF EXISTS "Authenticated users can update icp_data" ON public.icp_data;

CREATE POLICY "Admins can insert icp_data"
  ON public.icp_data FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can update icp_data"
  ON public.icp_data FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 10. FIX: client_portfolio - restrict to own or admin (was public role!)
DROP POLICY IF EXISTS "Authenticated users can insert client_portfolio" ON public.client_portfolio;
DROP POLICY IF EXISTS "Authenticated users can update client_portfolio" ON public.client_portfolio;

CREATE POLICY "Users can insert own client_portfolio"
  ON public.client_portfolio FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Users can update own client_portfolio"
  ON public.client_portfolio FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id() OR public.is_admin_or_manager(auth.uid()));
