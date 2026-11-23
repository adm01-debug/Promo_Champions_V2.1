CREATE OR REPLACE FUNCTION public.update_saved_filters_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public', 'extensions', 'auth', 'storage', 'cron', 'net', 'private', 'vault', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
