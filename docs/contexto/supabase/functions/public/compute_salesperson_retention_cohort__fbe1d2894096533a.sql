CREATE OR REPLACE FUNCTION public.compute_salesperson_retention_cohort(_months_back integer DEFAULT 12)
 RETURNS TABLE(cohort_month date, cohort_size integer, month_offset integer, retained integer, retention_pct numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH first_won AS (
    SELECT
      s.salesperson_id,
      date_trunc('month', MIN(s.created_at))::date AS cohort_month
    FROM public.sales s
    WHERE s.status = 'won' AND s.salesperson_id IS NOT NULL
    GROUP BY s.salesperson_id
  ),
  cohort_sizes AS (
    SELECT cohort_month, COUNT(*)::int AS cohort_size
    FROM first_won
    GROUP BY cohort_month
  ),
  activity AS (
    SELECT DISTINCT
      fw.cohort_month,
      fw.salesperson_id,
      (EXTRACT(YEAR FROM AGE(date_trunc('month', s.created_at), fw.cohort_month))::int * 12 +
       EXTRACT(MONTH FROM AGE(date_trunc('month', s.created_at), fw.cohort_month))::int) AS month_offset
    FROM first_won fw
    JOIN public.sales s
      ON s.salesperson_id = fw.salesperson_id
     AND s.status = 'won'
     AND s.created_at >= fw.cohort_month
  ),
  retained_counts AS (
    SELECT cohort_month, month_offset, COUNT(*)::int AS retained
    FROM activity
    WHERE month_offset BETWEEN 0 AND 11
    GROUP BY cohort_month, month_offset
  )
  SELECT
    cs.cohort_month,
    cs.cohort_size,
    rc.month_offset,
    rc.retained,
    ROUND((rc.retained::numeric / NULLIF(cs.cohort_size, 0)) * 100, 1) AS retention_pct
  FROM cohort_sizes cs
  JOIN retained_counts rc USING (cohort_month)
  WHERE cs.cohort_month >= (date_trunc('month', now()) - (_months_back || ' months')::interval)::date
  ORDER BY cs.cohort_month DESC, rc.month_offset ASC;
$function$
