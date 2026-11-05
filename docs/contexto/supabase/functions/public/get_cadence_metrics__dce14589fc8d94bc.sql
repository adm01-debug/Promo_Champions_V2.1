CREATE OR REPLACE FUNCTION public.get_cadence_metrics(_cadence_id uuid DEFAULT NULL::uuid, _days integer DEFAULT 30)
 RETURNS TABLE(cadence_id uuid, cadence_name text, total_enrolled integer, active_count integer, paused_count integer, completed_count integer, cancelled_count integer, auto_paused_count integer, total_tasks integer, tasks_completed integer, tasks_skipped integer, completion_rate numeric, reply_rate numeric, conversion_rate numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT c.id, c.name
    FROM public.cadences c
    WHERE _cadence_id IS NULL OR c.id = _cadence_id
  ),
  enrollments AS (
    SELECT
      pc.cadence_id,
      COUNT(*)::INT AS total,
      COUNT(*) FILTER (WHERE pc.status = 'active')::INT AS active,
      COUNT(*) FILTER (WHERE pc.status = 'paused')::INT AS paused,
      COUNT(*) FILTER (WHERE pc.status = 'completed')::INT AS completed,
      COUNT(*) FILTER (WHERE pc.status = 'cancelled')::INT AS cancelled,
      COUNT(*) FILTER (WHERE pc.paused_reason LIKE 'response_detected%')::INT AS auto_paused
    FROM public.prospect_cadences pc
    WHERE pc.created_at >= now() - (_days || ' days')::INTERVAL
    GROUP BY pc.cadence_id
  ),
  tasks AS (
    SELECT
      pc.cadence_id,
      COUNT(ct.*)::INT AS total_t,
      COUNT(ct.*) FILTER (WHERE ct.status = 'completed')::INT AS completed_t,
      COUNT(ct.*) FILTER (WHERE ct.status = 'skipped')::INT AS skipped_t
    FROM public.cadence_tasks ct
    JOIN public.prospect_cadences pc ON pc.id = ct.prospect_cadence_id
    WHERE pc.created_at >= now() - (_days || ' days')::INTERVAL
    GROUP BY pc.cadence_id
  ),
  responses AS (
    SELECT
      pc.cadence_id,
      COUNT(DISTINCT pc.sale_id)::INT AS replied
    FROM public.prospect_cadences pc
    JOIN public.channel_interactions ci ON ci.deal_id = pc.sale_id
    WHERE ci.direction = 'inbound'
      AND ci.created_at >= pc.started_at
      AND pc.created_at >= now() - (_days || ' days')::INTERVAL
    GROUP BY pc.cadence_id
  ),
  conversions AS (
    SELECT
      pc.cadence_id,
      COUNT(DISTINCT pc.sale_id)::INT AS converted
    FROM public.prospect_cadences pc
    JOIN public.sales s ON s.id = pc.sale_id
    WHERE s.status = 'completed'
      AND pc.created_at >= now() - (_days || ' days')::INTERVAL
    GROUP BY pc.cadence_id
  )
  SELECT
    b.id,
    b.name,
    COALESCE(e.total, 0),
    COALESCE(e.active, 0),
    COALESCE(e.paused, 0),
    COALESCE(e.completed, 0),
    COALESCE(e.cancelled, 0),
    COALESCE(e.auto_paused, 0),
    COALESCE(t.total_t, 0),
    COALESCE(t.completed_t, 0),
    COALESCE(t.skipped_t, 0),
    CASE WHEN COALESCE(t.total_t, 0) > 0
      THEN ROUND((t.completed_t::NUMERIC / t.total_t::NUMERIC) * 100, 1)
      ELSE 0 END,
    CASE WHEN COALESCE(e.total, 0) > 0
      THEN ROUND((COALESCE(r.replied, 0)::NUMERIC / e.total::NUMERIC) * 100, 1)
      ELSE 0 END,
    CASE WHEN COALESCE(e.total, 0) > 0
      THEN ROUND((COALESCE(cv.converted, 0)::NUMERIC / e.total::NUMERIC) * 100, 1)
      ELSE 0 END
  FROM base b
  LEFT JOIN enrollments e ON e.cadence_id = b.id
  LEFT JOIN tasks t ON t.cadence_id = b.id
  LEFT JOIN responses r ON r.cadence_id = b.id
  LEFT JOIN conversions cv ON cv.cadence_id = b.id
  ORDER BY COALESCE(e.total, 0) DESC;
END;
$function$
