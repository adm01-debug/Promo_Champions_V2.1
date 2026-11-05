CREATE OR REPLACE FUNCTION public.fn_slo_burn_rate(_window interval)
 RETURNS TABLE(source text, total bigint, failed bigint, rate numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Requer as duas tabelas-fonte (existem no schema canônico); o guard
  -- to_regclass em fn_check_slo_burn_rate evita chamá-la sem elas.
  WITH events AS (
    SELECT 'winloss_webhook' AS source, (NOT d.succeeded) AS failed
    FROM public.winloss_webhook_deliveries d
    WHERE d.created_at > now() - _window
    UNION ALL
    SELECT 'email', (e.status <> 'sent') AS failed
    FROM public.email_logs e
    WHERE e.created_at > now() - _window
  )
  SELECT source, count(*)::bigint AS total,
         count(*) FILTER (WHERE failed)::bigint AS failed,
         CASE WHEN count(*) = 0 THEN 0
              ELSE round(count(*) FILTER (WHERE failed)::numeric / count(*), 4)
         END AS rate
  FROM events
  GROUP BY source
  UNION ALL
  SELECT 'all', count(*)::bigint,
         count(*) FILTER (WHERE failed)::bigint,
         CASE WHEN count(*) = 0 THEN 0
              ELSE round(count(*) FILTER (WHERE failed)::numeric / count(*), 4)
         END
  FROM events;
$function$
