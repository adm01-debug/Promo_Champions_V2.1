
ALTER VIEW public.competitive_ranking SET (security_invoker = false);
-- Garantir que authenticated tem SELECT na view wrapper (defesa em profundidade)
GRANT SELECT ON public.competitive_ranking TO authenticated;
