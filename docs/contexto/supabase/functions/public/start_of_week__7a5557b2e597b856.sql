CREATE OR REPLACE FUNCTION public.start_of_week(date_val date, start_day integer DEFAULT 1)
 RETURNS date
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN date_val - (EXTRACT(DOW FROM date_val)::INT - start_day + 7) % 7;
END;
$function$
