CREATE OR REPLACE FUNCTION public.get_account_engagement_summary(_account_id uuid)
 RETURNS TABLE(account_id uuid, account_name text, total_contacts integer, engaged_contacts integer, avg_score numeric, coverage numeric, dominant_tier text, interactions_30d integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH contacts AS (
    SELECT ac.sale_id, ees.score, ees.tier
    FROM public.account_contacts ac
    LEFT JOIN public.email_engagement_scores ees ON ees.sale_id = ac.sale_id
    WHERE ac.account_id = _account_id AND ac.sale_id IS NOT NULL
  ),
  tier_counts AS (
    SELECT tier, count(*)::int AS c
    FROM contacts WHERE tier IS NOT NULL
    GROUP BY tier ORDER BY c DESC LIMIT 1
  ),
  ix AS (
    SELECT count(*)::int AS n
    FROM public.channel_interactions ci
    JOIN public.account_contacts ac ON ac.sale_id = ci.sale_id
    WHERE ac.account_id = _account_id AND ci.created_at > now() - interval '30 days'
  )
  SELECT
    a.id,
    a.name,
    (SELECT count(*)::int FROM contacts),
    (SELECT count(*)::int FROM contacts WHERE tier IN ('warm','hot','champion')),
    COALESCE((SELECT avg(score) FROM contacts WHERE score IS NOT NULL), 0)::numeric,
    CASE WHEN (SELECT count(*) FROM contacts) > 0
      THEN (SELECT count(*)::numeric FROM contacts WHERE tier IN ('warm','hot','champion')) / (SELECT count(*)::numeric FROM contacts) * 100
      ELSE 0 END,
    (SELECT tier FROM tier_counts LIMIT 1),
    (SELECT n FROM ix)
  FROM public.accounts a WHERE a.id = _account_id;
END;
$function$
