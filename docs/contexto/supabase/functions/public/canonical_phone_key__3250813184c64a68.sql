CREATE OR REPLACE FUNCTION public.canonical_phone_key(p_phone text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE STRICT
 SET search_path TO 'public'
AS $function$
  SELECT right(regexp_replace(p_phone, '\D', '', 'g'), 11);
$function$
