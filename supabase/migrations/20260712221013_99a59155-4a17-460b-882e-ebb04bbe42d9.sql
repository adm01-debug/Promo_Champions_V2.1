
-- Fix único ERROR do linter (0010_security_definer_view).
-- A view expõe dados agregados sanitizados (id, name, avatar, role, totals, rank);
-- não há colunas sensíveis. security_invoker=true elimina o warning e mantém
-- comportamento equivalente ao dar SELECT direto na MV para anon/authenticated.

ALTER VIEW public.competitive_ranking SET (security_invoker = true);

GRANT SELECT ON public.mv_competitive_ranking TO anon, authenticated;
