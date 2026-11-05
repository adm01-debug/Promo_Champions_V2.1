CREATE OR REPLACE FUNCTION public.get_app_config_number(p_key text, p_default numeric)
 RETURNS numeric
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT CASE jsonb_typeof(value)
       WHEN 'number' THEN (value)::numeric
       ELSE NULLIF(value #>> '{}', '')::numeric
     END
     FROM public.app_config WHERE key = p_key),
    p_default
  );
$function$
