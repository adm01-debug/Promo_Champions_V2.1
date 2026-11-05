CREATE OR REPLACE FUNCTION public.is_email_opted_out(_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.email_opt_outs
    WHERE lower(email) = lower(btrim(coalesce(_email, '')))
  );
$function$
