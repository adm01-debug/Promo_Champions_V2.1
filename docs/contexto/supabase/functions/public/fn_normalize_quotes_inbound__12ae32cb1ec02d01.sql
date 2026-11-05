CREATE OR REPLACE FUNCTION public.fn_normalize_quotes_inbound()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.seller_email IS NOT NULL THEN
    NEW.seller_email := lower(trim(E'\t\n\r ' FROM NEW.seller_email));
  END IF;
  IF NEW.source IS NOT NULL THEN
    NEW.source := lower(trim(E'\t\n\r ' FROM NEW.source));
  END IF;
  RETURN NEW;
END;
$function$
