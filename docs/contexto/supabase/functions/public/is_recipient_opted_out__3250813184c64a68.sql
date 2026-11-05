CREATE OR REPLACE FUNCTION public.is_recipient_opted_out(p_phone text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.clients cl
    WHERE cl.phone IS NOT NULL
      AND cl.email IS NOT NULL
      AND cl.deleted_at IS NULL
      AND public.canonical_phone_key(cl.phone) = public.canonical_phone_key(p_phone)
      AND public.is_email_opted_out(cl.email)
  )
  OR EXISTS (
    SELECT 1
    FROM public.account_contacts ac
    WHERE ac.phone IS NOT NULL
      AND ac.email IS NOT NULL
      AND public.canonical_phone_key(ac.phone) = public.canonical_phone_key(p_phone)
      AND public.is_email_opted_out(ac.email)
  );
$function$
