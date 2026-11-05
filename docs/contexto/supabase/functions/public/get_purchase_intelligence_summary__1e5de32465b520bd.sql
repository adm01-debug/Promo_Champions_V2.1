CREATE OR REPLACE FUNCTION public.get_purchase_intelligence_summary(_client_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _is_privileged boolean := public.has_role(_uid, 'admin') OR public.has_role(_uid, 'manager');
  _client_name text;
  _result jsonb;
  _total_purchases int;
  _total_revenue numeric;
  _avg_ticket numeric;
  _last_date timestamptz;
  _avg_cycle numeric;
  _share_me numeric;
  _share_others numeric;
  _top_competitor jsonb;
  _predicted_next date;
BEGIN
  SELECT name INTO _client_name FROM public.clients WHERE id = _client_id;
  IF _client_name IS NULL THEN
    RETURN jsonb_build_object('error', 'client_not_found');
  END IF;

  -- access check
  IF NOT _is_privileged THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.sales WHERE client_name = _client_name AND salesperson_id = _uid
    ) THEN
      RETURN jsonb_build_object('error', 'forbidden');
    END IF;
  END IF;

  SELECT
    COUNT(*)::int,
    COALESCE(SUM(amount), 0)::numeric,
    COALESCE(AVG(amount), 0)::numeric,
    MAX(created_at)
  INTO _total_purchases, _total_revenue, _avg_ticket, _last_date
  FROM public.sales
  WHERE client_name = _client_name AND status = 'won';

  -- avg cycle (days between consecutive won purchases)
  WITH ordered AS (
    SELECT created_at,
           LAG(created_at) OVER (ORDER BY created_at) AS prev_dt
    FROM public.sales
    WHERE client_name = _client_name AND status = 'won'
  )
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (created_at - prev_dt)) / 86400.0), 0)
  INTO _avg_cycle
  FROM ordered
  WHERE prev_dt IS NOT NULL;

  -- shares
  SELECT
    CASE WHEN _total_revenue > 0 THEN
      COALESCE(SUM(amount) FILTER (WHERE salesperson_id = _uid), 0) / _total_revenue * 100
    ELSE 0 END,
    CASE WHEN _total_revenue > 0 THEN
      COALESCE(SUM(amount) FILTER (WHERE salesperson_id <> _uid OR salesperson_id IS NULL), 0) / _total_revenue * 100
    ELSE 0 END
  INTO _share_me, _share_others
  FROM public.sales
  WHERE client_name = _client_name AND status = 'won';

  -- top internal competitor (other salesperson with most revenue)
  SELECT jsonb_build_object(
    'salesperson_id', sp.id,
    'salesperson_name', sp.name,
    'revenue', SUM(s.amount)::numeric,
    'deal_count', COUNT(*)::int
  )
  INTO _top_competitor
  FROM public.sales s
  LEFT JOIN public.salespeople sp ON sp.id = s.salesperson_id
  WHERE s.client_name = _client_name
    AND s.status = 'won'
    AND (s.salesperson_id IS DISTINCT FROM _uid)
  GROUP BY sp.id, sp.name
  ORDER BY SUM(s.amount) DESC NULLS LAST
  LIMIT 1;

  -- naive predicted next purchase = last + avg_cycle
  IF _last_date IS NOT NULL AND _avg_cycle > 0 THEN
    _predicted_next := (_last_date + (_avg_cycle || ' days')::interval)::date;
  END IF;

  _result := jsonb_build_object(
    'client_id', _client_id,
    'client_name', _client_name,
    'total_purchases', _total_purchases,
    'total_revenue', _total_revenue,
    'avg_ticket', _avg_ticket,
    'avg_cycle_days', ROUND(_avg_cycle, 1),
    'last_purchase_date', _last_date,
    'share_with_me_pct', ROUND(_share_me, 1),
    'share_with_others_pct', ROUND(_share_others, 1),
    'top_competitor_internal', _top_competitor,
    'predicted_next_purchase_date', _predicted_next,
    'days_since_last_purchase',
      CASE WHEN _last_date IS NOT NULL
        THEN EXTRACT(EPOCH FROM (now() - _last_date))::int / 86400
        ELSE NULL END,
    'computed_at', now()
  );

  RETURN _result;
END;
$function$
