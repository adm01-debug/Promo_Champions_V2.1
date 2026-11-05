CREATE OR REPLACE FUNCTION private.trigger_update_territories()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM private.update_territory_conquests();
    RETURN NEW;
END;
$function$
