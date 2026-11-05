CREATE OR REPLACE FUNCTION public.audit_log_row_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_actor UUID;
  v_email TEXT;
  v_req TEXT;
  v_old JSONB;
  v_new JSONB;
  v_id TEXT;
BEGIN
  v_actor := auth.uid();

  IF v_actor IS NOT NULL THEN
    SELECT email INTO v_email FROM auth.users WHERE id = v_actor;
  END IF;

  -- X-Request-Id propagado pelo PostgREST/edge functions (quando presente)
  BEGIN
    v_req := current_setting('request.headers', true)::jsonb ->> 'x-request-id';
  EXCEPTION WHEN OTHERS THEN
    v_req := NULL;
  END;

  v_old := CASE WHEN TG_OP IN ('UPDATE', 'DELETE')
                THEN public.audit_scrub(to_jsonb(OLD)) END;
  v_new := CASE WHEN TG_OP IN ('INSERT', 'UPDATE')
                THEN public.audit_scrub(to_jsonb(NEW)) END;

  IF TG_OP = 'DELETE' THEN
    v_id := to_jsonb(OLD) ->> 'id';
  ELSE
    v_id := to_jsonb(NEW) ->> 'id';
  END IF;

  INSERT INTO public.audit_logs (
    actor_id, actor_email, action,
    entity_type, entity_id,
    table_name, record_id,
    old_data, new_data, changes,
    request_id, metadata
  ) VALUES (
    v_actor, v_email, TG_OP,
    TG_TABLE_NAME, v_id,
    TG_TABLE_NAME, v_id,
    v_old, v_new,
    jsonb_build_object('old', v_old, 'new', v_new),
    v_req, '{}'::jsonb
  );

  RETURN COALESCE(NEW, OLD);
END;
$function$
