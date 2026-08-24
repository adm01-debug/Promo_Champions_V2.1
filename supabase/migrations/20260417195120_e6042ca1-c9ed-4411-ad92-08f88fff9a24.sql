-- ============================================================
-- Purchase Intelligence: RPCs + View
-- ============================================================

-- Helper: check if user is admin/manager
-- (assumes has_role function already exists)

-- 1) Heatmap RPC: returns monthly aggregated purchases per salesperson
CREATE OR REPLACE FUNCTION public.get_client_purchase_heatmap(
  _client_id uuid DEFAULT NULL,
  _months int DEFAULT 24
)
RETURNS TABLE (
  client_id uuid,
  client_name text,
  month_start date,
  salesperson_id uuid,
  salesperson_name text,
  is_current_user boolean,
  deal_count bigint,
  revenue numeric,
  won_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 2) Intelligence summary per client
CREATE OR REPLACE FUNCTION public.get_purchase_intelligence_summary(
  _client_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3) Seasonality view (avg revenue per month-of-year per client)
CREATE OR REPLACE VIEW public.client_purchase_seasonality
WITH (security_invoker = true)
AS
SELECT
  c.id AS client_id,
  c.name AS client_name,
  EXTRACT(MONTH FROM s.created_at)::int AS month_of_year,
  EXTRACT(DOW FROM s.created_at)::int AS day_of_week,
  COUNT(*)::int AS deal_count,
  COALESCE(AVG(s.amount), 0)::numeric AS avg_revenue,
  COALESCE(SUM(s.amount), 0)::numeric AS total_revenue
FROM public.sales s
JOIN public.clients c ON c.name = s.client_name
WHERE s.status = 'won'
GROUP BY c.id, c.name, EXTRACT(MONTH FROM s.created_at), EXTRACT(DOW FROM s.created_at);

-- Grants
GRANT EXECUTE ON FUNCTION public.get_client_purchase_heatmap(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_purchase_intelligence_summary(uuid) TO authenticated;
GRANT SELECT ON public.client_purchase_seasonality TO authenticated;