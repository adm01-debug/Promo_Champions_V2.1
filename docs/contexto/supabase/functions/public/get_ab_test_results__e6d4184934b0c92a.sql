CREATE OR REPLACE FUNCTION public.get_ab_test_results(_ab_test_id uuid)
 RETURNS TABLE(variant text, cadence_name text, enrolled integer, completed integer, replied integer, converted integer, reply_rate numeric, conversion_rate numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH test AS (
    SELECT id, variant_a_id, variant_b_id FROM public.cadence_ab_tests WHERE id = _ab_test_id
  ),
  base AS (
    SELECT 'a'::TEXT AS variant, (SELECT variant_a_id FROM test) AS cad_id
    UNION ALL
    SELECT 'b'::TEXT AS variant, (SELECT variant_b_id FROM test) AS cad_id
  ),
  stats AS (
    SELECT
      a.variant,
      COUNT(DISTINCT pc.id)::INT AS enrolled,
      COUNT(DISTINCT pc.id) FILTER (WHERE pc.status = 'completed')::INT AS completed,
      COUNT(DISTINCT ci.deal_id)::INT AS replied,
      COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed')::INT AS converted
    FROM public.cadence_ab_assignments a
    JOIN public.prospect_cadences pc ON pc.id = a.prospect_cadence_id
    LEFT JOIN public.channel_interactions ci ON ci.deal_id = pc.sale_id AND ci.direction = 'inbound' AND ci.created_at >= pc.started_at
    LEFT JOIN public.sales s ON s.id = pc.sale_id
    WHERE a.ab_test_id = _ab_test_id
    GROUP BY a.variant
  )
  SELECT
    b.variant,
    c.name,
    COALESCE(s.enrolled, 0),
    COALESCE(s.completed, 0),
    COALESCE(s.replied, 0),
    COALESCE(s.converted, 0),
    CASE WHEN COALESCE(s.enrolled, 0) > 0
      THEN ROUND((COALESCE(s.replied, 0)::NUMERIC / s.enrolled::NUMERIC) * 100, 1)
      ELSE 0 END,
    CASE WHEN COALESCE(s.enrolled, 0) > 0
      THEN ROUND((COALESCE(s.converted, 0)::NUMERIC / s.enrolled::NUMERIC) * 100, 1)
      ELSE 0 END
  FROM base b
  LEFT JOIN public.cadences c ON c.id = b.cad_id
  LEFT JOIN stats s ON s.variant = b.variant
  ORDER BY b.variant;
END;
$function$
