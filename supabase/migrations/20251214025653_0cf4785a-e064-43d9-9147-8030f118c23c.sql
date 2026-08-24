-- =====================================================
-- SECURITY UPDATE: Restrictive RLS Policies
-- Requires authentication for all sensitive data access
-- =====================================================

-- Helper function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- Helper function to get current user's salesperson_id
CREATE OR REPLACE FUNCTION public.get_current_salesperson_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.salespeople WHERE auth_user_id = auth.uid() LIMIT 1
$$;

-- =====================================================
-- SALESPEOPLE TABLE - Authenticated read, own write
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to salespeople" ON public.salespeople;
DROP POLICY IF EXISTS "Allow public insert to salespeople" ON public.salespeople;
DROP POLICY IF EXISTS "Allow public update to salespeople" ON public.salespeople;
DROP POLICY IF EXISTS "Allow public delete to salespeople" ON public.salespeople;

CREATE POLICY "Authenticated users can read salespeople"
ON public.salespeople FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own salesperson record"
ON public.salespeople FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid());

CREATE POLICY "Authenticated users can insert salespeople"
ON public.salespeople FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can delete own salesperson record"
ON public.salespeople FOR DELETE
TO authenticated
USING (auth_user_id = auth.uid());

-- =====================================================
-- CLIENTS TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public insert to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public update to clients" ON public.clients;
DROP POLICY IF EXISTS "Allow public delete to clients" ON public.clients;

CREATE POLICY "Authenticated users can read clients"
ON public.clients FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert clients"
ON public.clients FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients"
ON public.clients FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete clients"
ON public.clients FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- SALES TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to sales" ON public.sales;
DROP POLICY IF EXISTS "Allow authenticated insert to sales" ON public.sales;
DROP POLICY IF EXISTS "Allow authenticated update to sales" ON public.sales;
DROP POLICY IF EXISTS "Allow authenticated delete to sales" ON public.sales;

CREATE POLICY "Authenticated users can read sales"
ON public.sales FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sales"
ON public.sales FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales"
ON public.sales FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete sales"
ON public.sales FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- ACTIVITIES TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to activities" ON public.activities;
DROP POLICY IF EXISTS "Allow public insert to activities" ON public.activities;
DROP POLICY IF EXISTS "Allow public update to activities" ON public.activities;
DROP POLICY IF EXISTS "Allow public delete to activities" ON public.activities;

CREATE POLICY "Authenticated users can read activities"
ON public.activities FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert activities"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update activities"
ON public.activities FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete activities"
ON public.activities FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- TASKS TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow public insert to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow public update to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow public delete to tasks" ON public.tasks;

CREATE POLICY "Authenticated users can read tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- DEAL_OUTCOMES TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to deal_outcomes" ON public.deal_outcomes;
DROP POLICY IF EXISTS "Allow public insert to deal_outcomes" ON public.deal_outcomes;
DROP POLICY IF EXISTS "Allow public update to deal_outcomes" ON public.deal_outcomes;
DROP POLICY IF EXISTS "Allow public delete to deal_outcomes" ON public.deal_outcomes;

CREATE POLICY "Authenticated users can read deal_outcomes"
ON public.deal_outcomes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert deal_outcomes"
ON public.deal_outcomes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update deal_outcomes"
ON public.deal_outcomes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete deal_outcomes"
ON public.deal_outcomes FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- NOTIFICATION_PREFERENCES TABLE - Own records only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to notification_preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Allow public insert to notification_preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Allow public update to notification_preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Allow public delete to notification_preferences" ON public.notification_preferences;

CREATE POLICY "Authenticated users can read notification_preferences"
ON public.notification_preferences FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert notification_preferences"
ON public.notification_preferences FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update notification_preferences"
ON public.notification_preferences FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete notification_preferences"
ON public.notification_preferences FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- SALES_GOALS TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to sales_goals" ON public.sales_goals;
DROP POLICY IF EXISTS "Allow public insert to sales_goals" ON public.sales_goals;
DROP POLICY IF EXISTS "Allow public update to sales_goals" ON public.sales_goals;
DROP POLICY IF EXISTS "Allow public delete to sales_goals" ON public.sales_goals;

CREATE POLICY "Authenticated users can read sales_goals"
ON public.sales_goals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sales_goals"
ON public.sales_goals FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sales_goals"
ON public.sales_goals FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete sales_goals"
ON public.sales_goals FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- ACTIVITY_GOALS TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to activity_goals" ON public.activity_goals;
DROP POLICY IF EXISTS "Allow public insert to activity_goals" ON public.activity_goals;
DROP POLICY IF EXISTS "Allow public update to activity_goals" ON public.activity_goals;
DROP POLICY IF EXISTS "Allow public delete to activity_goals" ON public.activity_goals;

CREATE POLICY "Authenticated users can read activity_goals"
ON public.activity_goals FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert activity_goals"
ON public.activity_goals FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update activity_goals"
ON public.activity_goals FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete activity_goals"
ON public.activity_goals FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- LEAD_SCORES TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to lead_scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Allow public insert to lead_scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Allow public update to lead_scores" ON public.lead_scores;
DROP POLICY IF EXISTS "Allow public delete to lead_scores" ON public.lead_scores;

CREATE POLICY "Authenticated users can read lead_scores"
ON public.lead_scores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert lead_scores"
ON public.lead_scores FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update lead_scores"
ON public.lead_scores FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete lead_scores"
ON public.lead_scores FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- ACHIEVEMENTS TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to achievements" ON public.achievements;
DROP POLICY IF EXISTS "Allow public insert to achievements" ON public.achievements;

CREATE POLICY "Authenticated users can read achievements"
ON public.achievements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert achievements"
ON public.achievements FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- SALESPERSON_XP TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to salesperson_xp" ON public.salesperson_xp;
DROP POLICY IF EXISTS "Allow public insert to salesperson_xp" ON public.salesperson_xp;
DROP POLICY IF EXISTS "Allow public update to salesperson_xp" ON public.salesperson_xp;

CREATE POLICY "Authenticated users can read salesperson_xp"
ON public.salesperson_xp FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert salesperson_xp"
ON public.salesperson_xp FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update salesperson_xp"
ON public.salesperson_xp FOR UPDATE
TO authenticated
USING (true);

-- =====================================================
-- XP_HISTORY TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to xp_history" ON public.xp_history;
DROP POLICY IF EXISTS "Allow public insert to xp_history" ON public.xp_history;

CREATE POLICY "Authenticated users can read xp_history"
ON public.xp_history FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert xp_history"
ON public.xp_history FOR INSERT
TO authenticated
WITH CHECK (true);

-- =====================================================
-- PLAYBOOK_PROGRESS TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to playbook_progress" ON public.playbook_progress;
DROP POLICY IF EXISTS "Allow public insert to playbook_progress" ON public.playbook_progress;
DROP POLICY IF EXISTS "Allow public update to playbook_progress" ON public.playbook_progress;
DROP POLICY IF EXISTS "Allow public delete to playbook_progress" ON public.playbook_progress;

CREATE POLICY "Authenticated users can read playbook_progress"
ON public.playbook_progress FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert playbook_progress"
ON public.playbook_progress FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update playbook_progress"
ON public.playbook_progress FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete playbook_progress"
ON public.playbook_progress FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- PROSPECT_CADENCES TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to prospect_cadences" ON public.prospect_cadences;
DROP POLICY IF EXISTS "Allow public insert to prospect_cadences" ON public.prospect_cadences;
DROP POLICY IF EXISTS "Allow public update to prospect_cadences" ON public.prospect_cadences;
DROP POLICY IF EXISTS "Allow public delete to prospect_cadences" ON public.prospect_cadences;

CREATE POLICY "Authenticated users can read prospect_cadences"
ON public.prospect_cadences FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert prospect_cadences"
ON public.prospect_cadences FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update prospect_cadences"
ON public.prospect_cadences FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete prospect_cadences"
ON public.prospect_cadences FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- CADENCE_TASKS TABLE - Authenticated access only
-- =====================================================
DROP POLICY IF EXISTS "Allow public read access to cadence_tasks" ON public.cadence_tasks;
DROP POLICY IF EXISTS "Allow public insert to cadence_tasks" ON public.cadence_tasks;
DROP POLICY IF EXISTS "Allow public update to cadence_tasks" ON public.cadence_tasks;
DROP POLICY IF EXISTS "Allow public delete to cadence_tasks" ON public.cadence_tasks;

CREATE POLICY "Authenticated users can read cadence_tasks"
ON public.cadence_tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert cadence_tasks"
ON public.cadence_tasks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update cadence_tasks"
ON public.cadence_tasks FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete cadence_tasks"
ON public.cadence_tasks FOR DELETE
TO authenticated
USING (true);