-- Security Hardening: Convert views to SECURITY INVOKER
-- This ensures that views respect RLS policies of the querying user.

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER VIEW %I SET (security_invoker = true)', r.viewname);
    END LOOP;
END $$;

-- Revoke public EXECUTE on sensitive SECURITY DEFINER functions
-- These functions should only be callable by authenticated users or specifically authorized roles.

REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_current_salesperson_id() FROM public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_manager(uuid) FROM public;

-- Grant EXECUTE back to authenticated users
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_salesperson_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager(uuid) TO authenticated;

-- Tighten RLS policies where 'true' was used unnecessarily
-- Assuming 'authenticated' users should still have read access to some catalog tables, 
-- but sensitive logs and settings should be more restricted.

-- Example: integration_logs should only be viewable by admins/managers
DROP POLICY IF EXISTS "Allow authenticated users to view integration logs" ON public.integration_logs;
CREATE POLICY "Admins and managers can view integration logs"
ON public.integration_logs
FOR SELECT
USING (is_admin_or_manager(auth.uid()));

-- Example: error_logs should only be viewable by admins
DROP POLICY IF EXISTS "Anyone authenticated can view error logs" ON public.error_logs;
CREATE POLICY "Admins can view error logs"
ON public.error_logs
FOR SELECT
USING (is_admin_or_manager(auth.uid()));

-- Performance: Add indexes for common filter columns
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);
