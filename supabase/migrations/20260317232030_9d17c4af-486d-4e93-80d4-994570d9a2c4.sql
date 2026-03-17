
-- Fix: Make view use SECURITY INVOKER (default, safe) instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.salespeople_public;
CREATE VIEW public.salespeople_public 
WITH (security_invoker = on) AS
SELECT id, name, avatar_url, role, is_active, auth_user_id
FROM public.salespeople;

GRANT SELECT ON public.salespeople_public TO authenticated;
