
-- 1. Fix progressive_goals: restrict SELECT to own data or admin/manager
DROP POLICY IF EXISTS "Authenticated can view goals" ON public.progressive_goals;
CREATE POLICY "Users can view own goals or admin"
  ON public.progressive_goals FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 2. Fix activity_goals: restrict SELECT to own data or admin/manager
DROP POLICY IF EXISTS "Authenticated users can read activity_goals" ON public.activity_goals;
CREATE POLICY "Users can view own activity_goals or admin"
  ON public.activity_goals FOR SELECT TO authenticated
  USING (
    salesperson_id = public.get_current_salesperson_id()
    OR public.is_admin_or_manager(auth.uid())
  );

-- 3. Fix salespeople_public: revoke anon access, keep authenticated only
REVOKE ALL ON public.salespeople_public FROM anon;
GRANT SELECT ON public.salespeople_public TO authenticated;

-- 4. Fix cadence_tasks: restrict to ownership chain or admin/manager
DROP POLICY IF EXISTS "Authenticated users can read cadence_tasks" ON public.cadence_tasks;
CREATE POLICY "Users can view own cadence_tasks or admin"
  ON public.cadence_tasks FOR SELECT TO authenticated
  USING (
    prospect_cadence_id IN (
      SELECT id FROM public.prospect_cadences 
      WHERE salesperson_id = public.get_current_salesperson_id()
    )
    OR public.is_admin_or_manager(auth.uid())
  );

-- 5. Fix playbook_progress: restrict to own completed or own deals
DROP POLICY IF EXISTS "Authenticated users can read playbook_progress" ON public.playbook_progress;
CREATE POLICY "Users can view own playbook_progress or admin"
  ON public.playbook_progress FOR SELECT TO authenticated
  USING (
    completed_by = public.get_current_salesperson_id()
    OR sale_id IN (
      SELECT id FROM public.sales 
      WHERE salesperson_id = public.get_current_salesperson_id()
    )
    OR public.is_admin_or_manager(auth.uid())
  );
