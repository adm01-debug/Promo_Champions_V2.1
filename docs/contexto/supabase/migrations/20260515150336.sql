-- Revoke public execute on security definer functions
DO $$ 
DECLARE 
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as args
        FROM pg_proc 
        WHERE prosecdef = true AND pronamespace = 'public'::regnamespace
    LOOP
        EXECUTE format('REVOKE ALL ON FUNCTION %I(%s) FROM public, anon', func_record.proname, func_record.args);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %I(%s) TO authenticated, service_role', func_record.proname, func_record.args);
    END LOOP;
END $$;

-- Harden RLS for win_loss_analyses
DROP POLICY IF EXISTS "wla read auth" ON public.win_loss_analyses;
CREATE POLICY "wla read auth" ON public.win_loss_analyses 
FOR SELECT TO authenticated USING (
    (has_role(auth.uid(), 'admin'::app_role) OR 
     has_role(auth.uid(), 'manager'::app_role) OR 
     (EXISTS (
        SELECT 1 FROM sales s 
        WHERE s.id = win_loss_analyses.sale_id 
        AND s.salesperson_id = get_current_salesperson_id()
     )))
);

-- Harden RLS for lead_intelligence_metrics
DROP POLICY IF EXISTS "Public read lead_intelligence_metrics" ON public.lead_intelligence_metrics;
CREATE POLICY "Authenticated read lead_intelligence_metrics" ON public.lead_intelligence_metrics 
FOR SELECT TO authenticated USING (true);

-- Harden RLS for call_objection_analysis
DROP POLICY IF EXISTS "Authenticated read objection analysis" ON public.call_objection_analysis;
CREATE POLICY "Authenticated read objection analysis" ON public.call_objection_analysis 
FOR SELECT TO authenticated USING (
    (has_role(auth.uid(), 'admin'::app_role) OR 
     has_role(auth.uid(), 'manager'::app_role))
);

-- Harden error_logs
DROP POLICY IF EXISTS "Admins can view error logs" ON public.error_logs;
CREATE POLICY "Admins can view error logs" ON public.error_logs 
FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));
