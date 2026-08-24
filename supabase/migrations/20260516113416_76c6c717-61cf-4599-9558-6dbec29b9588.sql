-- Ensure public schema functions are accessible
GRANT EXECUTE ON FUNCTION public.is_admin_or_manager(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_salesperson_id() TO anon, authenticated;

-- Also verify if there are other variants of is_admin_or_manager
-- and grant execute on them as well if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public' AND p.proname = 'is_admin_or_manager' AND pg_get_function_arguments(p.oid) = '') THEN
        GRANT EXECUTE ON FUNCTION public.is_admin_or_manager() TO anon, authenticated;
    END IF;
END $$;
