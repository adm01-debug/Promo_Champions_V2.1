CREATE OR REPLACE FUNCTION public.search_call_library(_query text, _limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, title text, recorded_at timestamp with time zone, duration_seconds integer, salesperson_id uuid, status text, rank real, snippet text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ts_query tsquery;
  uid UUID := auth.uid();
  is_priv BOOLEAN := public.has_role(uid, 'admin') OR public.has_role(uid, 'manager');
BEGIN
  IF _query IS NULL OR length(trim(_query)) = 0 THEN
    RETURN;
  END IF;

  ts_query := websearch_to_tsquery('portuguese', _query);

  RETURN QUERY
  SELECT
    cr.id,
    cr.title,
    cr.recorded_at,
    cr.duration_seconds,
    cr.salesperson_id,
    cr.status,
    ts_rank(cr.transcript_tsv, ts_query) AS rank,
    ts_headline(
      'portuguese',
      coalesce(cr.transcript, cr.summary, cr.title),
      ts_query,
      'MaxWords=30, MinWords=10, ShortWord=3, HighlightAll=FALSE, MaxFragments=2, FragmentDelimiter=" … "'
    ) AS snippet
  FROM public.call_recordings cr
  LEFT JOIN public.salespeople sp ON sp.id = cr.salesperson_id
  WHERE cr.transcript_tsv @@ ts_query
    AND (is_priv OR sp.auth_user_id = uid)
  ORDER BY rank DESC, cr.recorded_at DESC
  LIMIT greatest(1, least(_limit, 100));
END;
$function$
