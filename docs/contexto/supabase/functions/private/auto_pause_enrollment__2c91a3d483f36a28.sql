CREATE OR REPLACE FUNCTION private.auto_pause_enrollment(_enrollment_id uuid, _reason text DEFAULT 'reply_detected'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _enr record;
BEGIN
  SELECT id, contact_id, contact_type, status
    INTO _enr
  FROM public.sequence_enrollments
  WHERE id = _enrollment_id;

  IF _enr.id IS NULL THEN
    RETURN;
  END IF;

  IF _enr.status = 'paused' THEN
    RETURN;
  END IF;

  UPDATE public.sequence_enrollments
     SET status = 'paused',
         auto_paused_at = now(),
         auto_pause_reason = COALESCE(_reason, 'reply_detected'),
         next_action_at = NULL
   WHERE id = _enrollment_id;

  -- Record engagement signal + recompute (best-effort)
  BEGIN
    PERFORM public.record_engagement_signal(_enr.contact_id, _enr.contact_type, 'reply', now());
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  BEGIN
    PERFORM public.recompute_engagement_score(_enr.contact_id, _enr.contact_type);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END;
$function$
