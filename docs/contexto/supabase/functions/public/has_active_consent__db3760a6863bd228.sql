CREATE OR REPLACE FUNCTION public.has_active_consent(p_subject_email text, p_purpose text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.consent_records c
    WHERE c.purpose = p_purpose
      AND c.revoked_at IS NULL
      AND lower(c.subject_email) = lower(p_subject_email)
  );
$function$
