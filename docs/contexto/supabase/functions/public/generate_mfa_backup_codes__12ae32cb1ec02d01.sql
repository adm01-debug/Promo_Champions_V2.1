CREATE OR REPLACE FUNCTION public.generate_mfa_backup_codes()
 RETURNS text[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  codes TEXT[] := ARRAY[]::TEXT[];
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    codes := array_append(codes, upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)));
  END LOOP;
  RETURN codes;
END;
$function$
