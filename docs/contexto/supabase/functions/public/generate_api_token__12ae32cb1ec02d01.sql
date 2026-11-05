CREATE OR REPLACE FUNCTION public.generate_api_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN '$' || encode(sha256((gen_random_uuid()::text || now()::text || random()::text)::bytea), 'hex');
END;
$function$
