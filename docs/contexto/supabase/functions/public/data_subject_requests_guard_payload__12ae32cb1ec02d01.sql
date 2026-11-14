CREATE OR REPLACE FUNCTION public.data_subject_requests_guard_payload()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_phone text;
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated'
     OR public.is_admin_or_manager(auth.uid()) THEN
    RETURN NEW;
  END IF;

  SELECT c.phone INTO v_phone
    FROM public.clients c
   WHERE lower(c.email) = lower(NEW.subject_email)
     AND c.phone IS NOT NULL
   LIMIT 1;

  IF v_phone IS NULL THEN
    NEW.payload := COALESCE(NEW.payload, '{}'::jsonb) - 'phone';
  ELSE
    NEW.payload := jsonb_set(
      COALESCE(NEW.payload, '{}'::jsonb), '{phone}', to_jsonb(v_phone), true);
  END IF;
  RETURN NEW;
END;
$function$
