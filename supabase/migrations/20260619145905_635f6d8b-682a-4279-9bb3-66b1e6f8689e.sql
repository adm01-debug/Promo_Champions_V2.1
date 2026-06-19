-- Improvement #4: Remove materialized view from Data API (lint 0016)
-- Strategy: revoke direct grants on MV and expose it through a regular view
-- that still benefits from the MV's pre-aggregated storage.

REVOKE ALL ON public.mv_competitive_ranking FROM anon, authenticated;

CREATE OR REPLACE VIEW public.competitive_ranking
WITH (security_invoker = true) AS
SELECT * FROM public.mv_competitive_ranking;

GRANT SELECT ON public.competitive_ranking TO authenticated;