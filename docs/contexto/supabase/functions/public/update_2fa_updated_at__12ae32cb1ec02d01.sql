CREATE OR REPLACE FUNCTION public.update_2fa_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public', 'extensions', 'auth', 'storage', 'cron', 'net', 'private', 'vault', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
