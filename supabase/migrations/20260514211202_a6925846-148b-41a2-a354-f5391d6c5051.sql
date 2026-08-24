-- 1. HARDEN RLS POLICIES
-- Fix overly permissive policies identified by the audit
DO $$
BEGIN
    -- cadence_alert_templates
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write for alert templates' AND tablename = 'cadence_alert_templates') THEN
        DROP POLICY "Public write for alert templates" ON public.cadence_alert_templates;
        CREATE POLICY "Service role manages alert templates" ON public.cadence_alert_templates FOR ALL TO service_role USING (true);
    END IF;

    -- cadence_outcome_rules
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write for outcome rules' AND tablename = 'cadence_outcome_rules') THEN
        DROP POLICY "Public write for outcome rules" ON public.cadence_outcome_rules;
        CREATE POLICY "Service role manages outcome rules" ON public.cadence_outcome_rules FOR ALL TO service_role USING (true);
    END IF;

    -- pipeline_coverage_recommendations
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update coverage recommendations' AND tablename = 'pipeline_coverage_recommendations') THEN
        DROP POLICY "Authenticated users can update coverage recommendations" ON public.pipeline_coverage_recommendations;
        CREATE POLICY "Managers can update coverage recommendations" ON public.pipeline_coverage_recommendations 
        FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager'));
    END IF;
END $$;

-- 2. HARDEN SECURITY DEFINER FUNCTIONS
-- Set search_path and restrict execution
CREATE OR REPLACE FUNCTION public.harden_function(func_name text) RETURNS void AS $$
BEGIN
    EXECUTE format('ALTER FUNCTION public.%I SET search_path = public', func_name);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I FROM PUBLIC', func_name);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I TO authenticated, service_role', func_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to core sensitive functions
SELECT harden_function('notify_critical_winloss_pattern');
SELECT harden_function('user_owns_sequence_step');
SELECT harden_function('disable_totp');
SELECT harden_function('record_lead_score_history');
SELECT harden_function('increment_sales_streak');
SELECT harden_function('verify_and_enable_sms');
SELECT harden_function('find_matching_cadence_rule');
SELECT harden_function('auto_enroll_quote_cadence');
SELECT harden_function('generate_cadence_tasks');
SELECT harden_function('update_own_profile');
SELECT harden_function('log_audit_event');
SELECT harden_function('has_role');
SELECT harden_function('has_permission');

DROP FUNCTION public.harden_function(text);

-- 3. DATA INTEGRITY CONSTRAINTS
ALTER TABLE public.sales ADD CONSTRAINT sales_amount_positive CHECK (amount >= 0);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_sale_id ON public.tasks(sale_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_sale_id ON public.deal_stage_history(sale_id);
