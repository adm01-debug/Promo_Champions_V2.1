CREATE OR REPLACE FUNCTION public.get_auto_paused_count(_days integer DEFAULT 7)
 RETURNS integer
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::INT
  FROM public.prospect_cadences
  WHERE paused_reason LIKE 'response_detected%'
    AND paused_at >= now() - (_days || ' days')::INTERVAL
$function$
