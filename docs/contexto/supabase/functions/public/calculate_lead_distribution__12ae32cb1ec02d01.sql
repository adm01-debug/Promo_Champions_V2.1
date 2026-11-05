CREATE OR REPLACE FUNCTION public.calculate_lead_distribution()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_object_agg(range, count) INTO result
  FROM (
    SELECT 
      CASE 
        WHEN score < 20 THEN '0-20'
        WHEN score < 40 THEN '21-40'
        WHEN score < 60 THEN '41-60'
        WHEN score < 80 THEN '61-80'
        ELSE '81-100'
      END as range,
      count(*) as count
    FROM public.lead_scores
    GROUP BY range
  ) sub;
  RETURN COALESCE(result, '{}'::jsonb);
END;
$function$
