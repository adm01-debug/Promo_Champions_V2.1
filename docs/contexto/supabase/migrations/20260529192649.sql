-- Security Hardening Migration

-- 1. Revoke public execute from all functions in public schema
-- This addresses the 0028_anon_security_definer_function_executable warnings
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- 2. Explicitly grant execute to authenticated and service_role for known RPCs
-- (Add common RPCs here, or use a loop if needed, but explicit is safer for a migration)
GRANT EXECUTE ON FUNCTION public.get_client_top_products(uuid, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_industry_top_products(uuid[], integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_industry_benchmark_stats(uuid[], integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_client_seasonality(uuid, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_industry_seasonality(uuid[], integer) TO authenticated, service_role;

-- 3. Ensure RLS is enabled on critical tables (idempotent)
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- 4. Fix overly permissive RLS policies (Warning 0024_permissive_rls_policy)
-- Replace "USING (true)" with safer checks where possible
-- Note: SELECT using(true) is often okay if data is public, but we should be careful.
-- For "clients", let's ensure authenticated users can see them.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read' AND tablename = 'clients') THEN
        DROP POLICY "Allow public read" ON public.clients;
    END IF;
END $$;

CREATE POLICY "Clients are viewable by authenticated users" 
ON public.clients FOR SELECT 
TO authenticated 
USING (true);

-- 5. Tighten storage bucket security (Warning 0025_public_bucket_allows_listing)
-- Note: This requires specific bucket names, assuming 'dossiers' or 'attachments' exist.
-- We can't easily loop over buckets here without knowing names, but we'll focus on the Data API warnings first.
