
-- =====================================================
-- FIX: All remaining critical + warning security findings
-- =====================================================

-- 1. CRITICAL: chat_conversations - fix DELETE, UPDATE, INSERT
DROP POLICY IF EXISTS "Authenticated users can delete chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Authenticated users can update chat_conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Authenticated users can insert chat_conversations" ON public.chat_conversations;

CREATE POLICY "Users can insert own chat_conversations"
  ON public.chat_conversations FOR INSERT TO authenticated
  WITH CHECK (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can update own chat_conversations"
  ON public.chat_conversations FOR UPDATE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id());

CREATE POLICY "Users can delete own chat_conversations"
  ON public.chat_conversations FOR DELETE TO authenticated
  USING (salesperson_id = public.get_current_salesperson_id());

-- 2. CRITICAL: digital_signatures - fix SELECT and UPDATE
DROP POLICY IF EXISTS "Authenticated users can read digital_signatures" ON public.digital_signatures;
DROP POLICY IF EXISTS "Authenticated users can update digital_signatures" ON public.digital_signatures;

CREATE POLICY "Users can read own digital_signatures"
  ON public.digital_signatures FOR SELECT TO authenticated
  USING (
    created_by = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

CREATE POLICY "Users can update own digital_signatures"
  ON public.digital_signatures FOR UPDATE TO authenticated
  USING (
    created_by = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 3. CRITICAL: chat_messages - fix INSERT
DROP POLICY IF EXISTS "Authenticated users can insert chat_messages" ON public.chat_messages;

CREATE POLICY "Users can insert own chat_messages"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.chat_conversations
      WHERE salesperson_id = public.get_current_salesperson_id()
    )
  );

-- 4. WARN: lead_routing_log - fix SELECT from {public} to {authenticated}
DROP POLICY IF EXISTS "Authenticated users can read lead_routing_log" ON public.lead_routing_log;

CREATE POLICY "Admin and managers can read lead_routing_log"
  ON public.lead_routing_log FOR SELECT TO authenticated
  USING (public.is_admin_or_manager(auth.uid()));

-- 5. WARN: daily_streak_achievements, challenge_progress, daily_challenge_progress - fix from {public} to {authenticated}
DROP POLICY IF EXISTS "Authenticated users can read daily_streak_achievements" ON public.daily_streak_achievements;
CREATE POLICY "Users can read own daily_streak_achievements"
  ON public.daily_streak_achievements FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can read challenge_progress" ON public.challenge_progress;
CREATE POLICY "Users can read own challenge_progress"
  ON public.challenge_progress FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated users can read daily_challenge_progress" ON public.daily_challenge_progress;
CREATE POLICY "Users can read own daily_challenge_progress"
  ON public.daily_challenge_progress FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 6. WARN: teams - fix from {public} to {authenticated}
DROP POLICY IF EXISTS "Authenticated users can read teams" ON public.teams;
CREATE POLICY "Authenticated users can read teams"
  ON public.teams FOR SELECT TO authenticated
  USING (true);
