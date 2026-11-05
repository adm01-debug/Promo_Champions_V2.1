CREATE OR REPLACE FUNCTION public.get_semantic_coverage()
 RETURNS TABLE(entity_type text, total_rows bigint, indexed_rows bigint, coverage_pct numeric, last_indexed timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT 'client'::text AS et, (SELECT count(*) FROM public.clients) AS total
    UNION ALL SELECT 'lead', (SELECT count(*) FROM public.sales WHERE status IN ('lead','prospecting','qualified'))
    UNION ALL SELECT 'deal', (SELECT count(*) FROM public.sales WHERE status IN ('proposal','negotiation','won','lost','closed'))
    UNION ALL SELECT 'activity', (SELECT count(*) FROM public.activities)
    UNION ALL SELECT 'call_recording', (SELECT count(*) FROM public.call_recordings)
  ),
  idx AS (
    SELECT entity_type AS et, count(*) AS indexed, max(updated_at) AS last_at
    FROM public.semantic_index
    GROUP BY entity_type
  )
  SELECT
    b.et,
    b.total,
    COALESCE(i.indexed, 0),
    CASE WHEN b.total = 0 THEN 100::numeric
         ELSE ROUND((COALESCE(i.indexed,0)::numeric / b.total::numeric) * 100, 1)
    END,
    i.last_at
  FROM base b
  LEFT JOIN idx i ON i.et = b.et
  ORDER BY b.et;
END;
$function$
