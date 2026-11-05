CREATE OR REPLACE FUNCTION private.compute_cohort_retention(_cohort_id uuid, _periods integer DEFAULT 12)
 RETURNS TABLE(cohort_period text, period_offset integer, customers integer, retention_pct numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _c RECORD;
  _trunc TEXT;
BEGIN
  SELECT * INTO _c FROM public.cohort_analyses
    WHERE id = _cohort_id AND (owner_id = auth.uid() OR is_admin_or_manager(auth.uid()));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cohort não encontrado ou sem permissão';
  END IF;

  _trunc := CASE _c.period_type
    WHEN 'week' THEN 'week'
    WHEN 'quarter' THEN 'quarter'
    ELSE 'month'
  END;

  RETURN QUERY EXECUTE format($f$
    WITH cohorts AS (
      SELECT
        client_name,
        date_trunc(%L, MIN(created_at)) AS first_period
      FROM public.sales
      WHERE status = 'completed'
      GROUP BY client_name
    ),
    activity AS (
      SELECT
        c.first_period,
        date_trunc(%L, s.created_at) AS active_period,
        s.client_name
      FROM cohorts c
      JOIN public.sales s ON s.client_name = c.client_name
      WHERE s.status = 'completed'
    ),
    cohort_size AS (
      SELECT first_period, COUNT(DISTINCT client_name)::INT AS total
      FROM cohorts GROUP BY first_period
    )
    SELECT
      to_char(a.first_period, 'YYYY-MM-DD') AS cohort_period,
      EXTRACT(epoch FROM (a.active_period - a.first_period))::INT / CASE %L WHEN 'week' THEN 604800 WHEN 'quarter' THEN 7776000 ELSE 2592000 END AS period_offset,
      COUNT(DISTINCT a.client_name)::INT AS customers,
      ROUND(100.0 * COUNT(DISTINCT a.client_name)::NUMERIC / NULLIF(cs.total,0), 1) AS retention_pct
    FROM activity a
    JOIN cohort_size cs ON cs.first_period = a.first_period
    WHERE a.first_period >= now() - ($1 * INTERVAL '1 month')
    GROUP BY a.first_period, a.active_period, cs.total
    ORDER BY a.first_period DESC, period_offset ASC
  $f$, _trunc, _trunc, _trunc) USING _periods;
END;
$function$
