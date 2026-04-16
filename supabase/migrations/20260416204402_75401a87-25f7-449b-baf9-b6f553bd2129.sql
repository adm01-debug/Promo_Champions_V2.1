-- 1. Fix pipelines & pipeline_stages: restrict mutations to admin/manager
DROP POLICY IF EXISTS "Authenticated users can manage pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "Allow all on pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "pipelines_all_authenticated" ON public.pipelines;

CREATE POLICY "pipelines_select_authenticated"
ON public.pipelines FOR SELECT TO authenticated USING (true);

CREATE POLICY "pipelines_insert_admin_manager"
ON public.pipelines FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "pipelines_update_admin_manager"
ON public.pipelines FOR UPDATE TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "pipelines_delete_admin_manager"
ON public.pipelines FOR DELETE TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can manage pipeline_stages" ON public.pipeline_stages;
DROP POLICY IF EXISTS "Allow all on pipeline_stages" ON public.pipeline_stages;
DROP POLICY IF EXISTS "pipeline_stages_all_authenticated" ON public.pipeline_stages;

CREATE POLICY "pipeline_stages_select_authenticated"
ON public.pipeline_stages FOR SELECT TO authenticated USING (true);

CREATE POLICY "pipeline_stages_insert_admin_manager"
ON public.pipeline_stages FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "pipeline_stages_update_admin_manager"
ON public.pipeline_stages FOR UPDATE TO authenticated
USING (public.is_admin_or_manager(auth.uid()))
WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "pipeline_stages_delete_admin_manager"
ON public.pipeline_stages FOR DELETE TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

-- 2. Fix nps_surveys: restrict to owning salesperson + admin/manager
DROP POLICY IF EXISTS "Authenticated users can manage nps_surveys" ON public.nps_surveys;
DROP POLICY IF EXISTS "Allow all on nps_surveys" ON public.nps_surveys;
DROP POLICY IF EXISTS "nps_surveys_select_all" ON public.nps_surveys;
DROP POLICY IF EXISTS "nps_surveys_update_all" ON public.nps_surveys;
DROP POLICY IF EXISTS "nps_surveys_insert_all" ON public.nps_surveys;

CREATE POLICY "nps_surveys_select_owner_or_manager"
ON public.nps_surveys FOR SELECT TO authenticated
USING (
  salesperson_id = public.get_current_salesperson_id()
  OR public.is_admin_or_manager(auth.uid())
);

CREATE POLICY "nps_surveys_insert_owner_or_manager"
ON public.nps_surveys FOR INSERT TO authenticated
WITH CHECK (
  salesperson_id = public.get_current_salesperson_id()
  OR public.is_admin_or_manager(auth.uid())
);

CREATE POLICY "nps_surveys_update_owner_or_manager"
ON public.nps_surveys FOR UPDATE TO authenticated
USING (
  salesperson_id = public.get_current_salesperson_id()
  OR public.is_admin_or_manager(auth.uid())
)
WITH CHECK (
  salesperson_id = public.get_current_salesperson_id()
  OR public.is_admin_or_manager(auth.uid())
);

CREATE POLICY "nps_surveys_delete_admin_manager"
ON public.nps_surveys FOR DELETE TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

-- 3. Fix automation_runs: restrict SELECT to admin/manager, INSERT to service_role only
DROP POLICY IF EXISTS "Authenticated users can view automation_runs" ON public.automation_runs;
DROP POLICY IF EXISTS "Authenticated users can insert automation_runs" ON public.automation_runs;
DROP POLICY IF EXISTS "automation_runs_select_all" ON public.automation_runs;
DROP POLICY IF EXISTS "automation_runs_insert_all" ON public.automation_runs;
DROP POLICY IF EXISTS "Allow all on automation_runs" ON public.automation_runs;

CREATE POLICY "automation_runs_select_admin_manager"
ON public.automation_runs FOR SELECT TO authenticated
USING (public.is_admin_or_manager(auth.uid()));

-- INSERT only allowed via service role (edge functions). No policy = blocked for authenticated.
-- Service role bypasses RLS by default.