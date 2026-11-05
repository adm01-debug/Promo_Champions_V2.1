CREATE OR REPLACE FUNCTION private.trg_recompute_engagement()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.recompute_engagement_score(NEW.contact_id, NEW.contact_type);
  RETURN NEW;
END;
$function$
