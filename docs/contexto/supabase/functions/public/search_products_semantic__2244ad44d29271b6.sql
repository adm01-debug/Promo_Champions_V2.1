CREATE OR REPLACE FUNCTION public.search_products_semantic(_keywords text[], _query text DEFAULT NULL::text, _limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, name text, category text, price numeric, rating numeric, sales_count integer, status text, similarity_score real)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _combined text;
BEGIN
  _combined := trim(COALESCE(_query, '') || ' ' || array_to_string(COALESCE(_keywords, ARRAY[]::text[]), ' '));

  IF _combined = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.category,
    p.price,
    p.rating,
    p.sales_count,
    p.status,
    GREATEST(
      similarity(COALESCE(p.name, ''), _combined),
      similarity(COALESCE(p.category, ''), _combined) * 0.6
    )::real AS similarity_score
  FROM public.products p
  WHERE
    p.name % _combined
    OR p.category % _combined
    OR EXISTS (
      SELECT 1 FROM unnest(_keywords) AS kw
      WHERE p.name ILIKE '%' || kw || '%'
         OR p.category ILIKE '%' || kw || '%'
    )
  ORDER BY similarity_score DESC, p.sales_count DESC
  LIMIT _limit;
END;
$function$
