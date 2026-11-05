CREATE OR REPLACE FUNCTION public.coaching_progress_by_salesperson(_salesperson_id uuid, _days integer DEFAULT 30)
 RETURNS TABLE(category text, severity text, status text, count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT category, severity, status, COUNT(*)::bigint
  FROM public.coaching_actions
  WHERE salesperson_id = _salesperson_id
    AND created_at >= now() - (_days || ' days')::interval
  GROUP BY category, severity, status
$function$
