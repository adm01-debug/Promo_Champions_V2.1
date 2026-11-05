CREATE OR REPLACE FUNCTION public.get_client_purchase_heatmap(_client_id uuid DEFAULT NULL::uuid, _months integer DEFAULT 24)
 RETURNS TABLE(client_id uuid, client_name text, month_start date, salesperson_id uuid, salesperson_name text, is_current_user boolean, deal_count bigint, revenue numeric, won_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _is_privileged boolean := public.has_role(_uid, 'admin') OR public.has_role(_uid, 'manager');
  _start date := (date_trunc('month', now()) - (_months || ' months')::interval)::date;
BEGIN
  RETURN QUERY
  SELECT
    c.id AS client_id,
    c.name AS client_name,
    date_trunc('month', s.created_at)::date AS month_start,
    s.salesperson_id,
    sp.name AS salesperson_name,
    (s.salesperson_id = _uid) AS is_current_user,
    COUNT(*)::bigint AS deal_count,
    COALESCE(SUM(s.amount), 0)::numeric AS revenue,
    COUNT(*) FILTER (WHERE s.status = 'won')::bigint AS won_count
  FROM public.sales s
  JOIN public.clients c ON c.name = s.client_name
  LEFT JOIN public.salespeople sp ON sp.id = s.salesperson_id
  WHERE s.created_at >= _start
    AND (_client_id IS NULL OR c.id = _client_id)
    AND (
      _is_privileged
      OR EXISTS (
        SELECT 1 FROM public.sales s2
        WHERE s2.client_name = c.name AND s2.salesperson_id = _uid
      )
    )
  GROUP BY c.id, c.name, date_trunc('month', s.created_at), s.salesperson_id, sp.name
  ORDER BY month_start DESC, revenue DESC;
END;
$function$
