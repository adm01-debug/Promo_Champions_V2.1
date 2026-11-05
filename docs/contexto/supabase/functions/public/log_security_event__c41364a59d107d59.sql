CREATE OR REPLACE FUNCTION public.log_security_event(p_event_type text, p_severity text, p_description text, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_event_id uuid;
BEGIN
  IF auth.uid() IS NULL AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;
  IF p_severity NOT IN ('low', 'medium', 'high', 'critical') THEN
    RAISE EXCEPTION 'severity_invalid' USING ERRCODE = '22023';
  END IF;
  IF length(trim(COALESCE(p_event_type, ''))) NOT BETWEEN 1 AND 100
     OR length(trim(COALESCE(p_description, ''))) NOT BETWEEN 1 AND 4000 THEN
    RAISE EXCEPTION 'event_payload_invalid' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.security_events (
    user_id, event_type, severity, description, metadata
  ) VALUES (
    auth.uid(),
    left(trim(p_event_type), 100),
    p_severity,
    left(trim(p_description), 4000),
    p_metadata
  ) RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$function$
