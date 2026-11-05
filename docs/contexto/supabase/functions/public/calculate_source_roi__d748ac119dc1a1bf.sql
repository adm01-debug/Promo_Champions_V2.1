CREATE OR REPLACE FUNCTION public.calculate_source_roi(_source text, _days integer DEFAULT 30)
 RETURNS TABLE(total_leads bigint, total_revenue numeric, roi_index numeric)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(s.id)::BIGINT as total_leads,
        COALESCE(SUM(s.amount), 0) as total_revenue,
        CASE 
            WHEN (SELECT monthly_budget FROM public.lead_source_configs WHERE source_name = _source) > 0 
            THEN (COALESCE(SUM(s.amount), 0) / (SELECT monthly_budget FROM public.lead_source_configs WHERE source_name = _source))
            ELSE 0 
        END as roi_index
    FROM public.sales s
    WHERE s.source = _source
    AND s.created_at >= (now() - (_days || ' days')::interval);
END;
$function$
