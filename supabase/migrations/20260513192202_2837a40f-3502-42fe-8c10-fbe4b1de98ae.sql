CREATE OR REPLACE VIEW public.salespeople_public 
WITH (security_invoker = true)
AS
 SELECT id,
    name,
    avatar_url,
    role,
    is_active
   FROM public.salespeople
  WHERE (is_active = true);
