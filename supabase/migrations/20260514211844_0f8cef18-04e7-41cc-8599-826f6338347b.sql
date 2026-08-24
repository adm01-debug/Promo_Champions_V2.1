-- 1. RESILIENT FUNCTION HARDENING
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.prokind = 'f' -- only normal functions
    LOOP
        BEGIN
            -- Try to apply search_path
            EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', 
                func_record.function_name, func_record.args);

            -- Try to revoke public execution
            EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC', 
                func_record.function_name, func_record.args);

            -- Try to grant to internal roles
            EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated, service_role', 
                func_record.function_name, func_record.args);
        EXCEPTION WHEN OTHERS THEN
            -- Skip functions we don't own (like extension functions)
            RAISE NOTICE 'Skipping function %: %', func_record.function_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 2. ENSURE RLS IS ENABLED ON ALL TABLES
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;
