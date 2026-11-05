-- Security: Revoke execute on all functions in public schema from PUBLIC role
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- Re-grant execute to authenticated users for necessary functions
-- This is a non-exhaustive list, but covers common requirements.
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Ensure certain admin-only functions are NOT granted even to authenticated users
REVOKE EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb, jsonb) TO postgres, service_role;

-- Special cases: functions that might be called by anonymous users (e.g. login helpers)
-- If there are any, grant them here. For this project, we assume all critical functions are authenticated.
