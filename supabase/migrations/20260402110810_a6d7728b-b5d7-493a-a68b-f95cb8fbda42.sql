
REVOKE ALL ON public.salespeople_public FROM anon;
GRANT SELECT ON public.salespeople_public TO authenticated;
