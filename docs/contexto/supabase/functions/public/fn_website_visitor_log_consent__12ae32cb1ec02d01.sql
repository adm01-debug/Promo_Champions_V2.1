CREATE OR REPLACE FUNCTION public.fn_website_visitor_log_consent()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.retention_expires_at IS NULL THEN
    NEW.retention_expires_at := COALESCE(NEW.identified_at, now()) + interval '90 days';
  END IF;

  IF NEW.consent_record_id IS NULL AND NEW.domain IS NOT NULL THEN
    SELECT c.id INTO NEW.consent_record_id
    FROM public.consent_records c
    WHERE c.purpose = 'visitor_tracking'
      AND c.revoked_at IS NULL
      AND c.subject_email IS NOT NULL
      AND lower(split_part(c.subject_email, '@', 2)) = lower(NEW.domain)
    ORDER BY c.granted_at DESC
    LIMIT 1;

    IF NEW.consent_record_id IS NOT NULL THEN
      NEW.legal_basis := 'consent';
      NEW.retention_expires_at := NULL; -- guarda regida pelo consentimento, não pela janela
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
