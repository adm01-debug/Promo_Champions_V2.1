CREATE OR REPLACE FUNCTION public.record_email_opt_out(_email text, _reason text DEFAULT NULL::text, _source text DEFAULT 'unsubscribe_link'::text, _owner_id uuid DEFAULT NULL::uuid, _metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email text := lower(btrim(coalesce(_email, '')));
  v_id uuid;
BEGIN
  IF v_email = '' OR position('@' in v_email) = 0 THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;

  INSERT INTO public.email_opt_outs (email, reason, source, owner_id, metadata)
  VALUES (v_email, _reason, coalesce(_source, 'unsubscribe_link'), _owner_id, coalesce(_metadata, '{}'::jsonb))
  ON CONFLICT (lower(email)) DO UPDATE
    SET reason = coalesce(EXCLUDED.reason, public.email_opt_outs.reason),
        source = EXCLUDED.source
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$
