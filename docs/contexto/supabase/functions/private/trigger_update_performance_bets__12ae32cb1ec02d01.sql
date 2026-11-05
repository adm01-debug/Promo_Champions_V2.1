CREATE OR REPLACE FUNCTION private.trigger_update_performance_bets()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM private.update_performance_bet_progress();
    RETURN NEW;
END;
$function$
