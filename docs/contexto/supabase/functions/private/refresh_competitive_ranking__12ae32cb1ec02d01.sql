CREATE OR REPLACE FUNCTION private.refresh_competitive_ranking()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_competitive_ranking;
END;
$function$
