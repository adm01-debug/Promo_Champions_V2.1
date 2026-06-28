
GRANT SELECT ON public.competitive_ranking TO authenticated;
GRANT SELECT ON public.mv_competitive_ranking TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.password_reset_requests TO authenticated;
GRANT ALL ON public.password_reset_requests TO service_role;
