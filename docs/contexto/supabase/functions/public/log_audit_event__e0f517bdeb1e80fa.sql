CREATE OR REPLACE FUNCTION public.log_audit_event(_action text, _entity_type text, _entity_id text DEFAULT NULL::text, _changes jsonb DEFAULT '{}'::jsonb, _metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _id UUID;
  _email TEXT;
  _req TEXT;
BEGIN
  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();

  BEGIN
    _req := current_setting('request.headers', true)::jsonb ->> 'x-request-id';
  EXCEPTION WHEN OTHERS THEN
    _req := NULL;
  END;

  INSERT INTO public.audit_logs (
    actor_id, actor_email, action,
    entity_type, entity_id,
    table_name, record_id,
    changes, request_id, metadata
  ) VALUES (
    auth.uid(), _email, _action,
    _entity_type, _entity_id,
    _entity_type, _entity_id,
    public.audit_scrub(_changes), _req, _metadata
  )
  RETURNING id INTO _id;

  RETURN _id;
END;
$function$
