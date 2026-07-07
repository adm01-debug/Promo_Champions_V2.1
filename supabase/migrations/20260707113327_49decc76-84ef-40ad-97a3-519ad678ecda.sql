CREATE OR REPLACE VIEW public.v_rate_limit_blocked_sellers
WITH (security_invoker = true) AS
SELECT
  identifier,
  identifier_type,
  action AS endpoint,
  request_count,
  window_start,
  window_end AS blocked_until,
  EXTRACT(EPOCH FROM (window_end - now())) AS seconds_until_unblock,
  created_at
FROM public.rate_limit_logs
WHERE action = 'quote-sync-promo-champions'
  AND blocked = true
  AND window_end IS NOT NULL
  AND window_end > now()
ORDER BY window_end DESC;

COMMENT ON VIEW public.v_rate_limit_blocked_sellers IS
  'Identificadores bloqueados pelo rate limit de sync com Champions V2 (leitura respeita RLS de rate_limit_logs — só admin/manager).';

GRANT SELECT ON public.v_rate_limit_blocked_sellers TO authenticated;