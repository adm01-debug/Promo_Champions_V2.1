CREATE OR REPLACE FUNCTION public.get_top_accounts(_limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, name text, tier text, account_score integer, coverage numeric, engaged_contacts integer, champion_count integer, decision_maker_count integer, industry text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT a.id, a.name, a.tier, a.account_score, a.coverage,
         a.engaged_contacts, a.champion_count, a.decision_maker_count, a.industry
  FROM public.accounts a
  ORDER BY a.account_score DESC NULLS LAST, a.coverage DESC NULLS LAST
  LIMIT COALESCE(_limit, 20);
$function$
