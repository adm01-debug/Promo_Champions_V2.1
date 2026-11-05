CREATE OR REPLACE FUNCTION public.get_industry_benchmark_stats(_company_ids uuid[], _days integer DEFAULT 180)
 RETURNS TABLE(metric_name text, industry_avg numeric, unit text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 'Volume'::TEXT, 75.0::NUMERIC, 'un'::TEXT
    UNION ALL
    SELECT 'Conversão'::TEXT, 10.5::NUMERIC, '%'::TEXT
    UNION ALL
    SELECT 'Frequência'::TEXT, 3.8::NUMERIC, 'ped/mês'::TEXT
    UNION ALL
    SELECT 'Satisfação'::TEXT, 85.0::NUMERIC, 'pts'::TEXT;
END;
$function$
