CREATE OR REPLACE FUNCTION public.trg_refresh_ranking_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM private.refresh_competitive_ranking();
    RETURN NULL;
END;
$function$
