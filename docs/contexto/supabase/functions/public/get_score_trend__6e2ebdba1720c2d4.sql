CREATE OR REPLACE FUNCTION public.get_score_trend(_sale_id uuid, _days integer DEFAULT 30)
 RETURNS TABLE(recorded_at timestamp with time zone, score integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT h.recorded_at, h.score
  FROM public.lead_score_history h
  WHERE h.sale_id = _sale_id
    AND h.recorded_at >= now() - (_days || ' days')::interval
    AND (
      EXISTS (
        SELECT 1 FROM public.sales s
        JOIN public.salespeople sp ON sp.id = s.salesperson_id
        WHERE s.id = _sale_id AND sp.auth_user_id = auth.uid()
      )
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'manager')
    )
  ORDER BY h.recorded_at ASC;
$function$
