CREATE OR REPLACE FUNCTION public.update_call_recording_diarization(_id uuid, _diarization jsonb, _talk_ratio_seller numeric, _talk_ratio_client numeric, _longest_monologue_sec integer, _interruptions_count integer, _turns_count integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _sp uuid;
  _owner uuid;
BEGIN
  SELECT salesperson_id INTO _owner FROM public.call_recordings WHERE id = _id;
  IF _owner IS NULL THEN
    RAISE EXCEPTION 'Recording not found';
  END IF;

  SELECT public.get_current_salesperson_id() INTO _sp;
  IF _sp IS NULL OR _sp <> _owner THEN
    -- allow admins
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
  END IF;

  UPDATE public.call_recordings
  SET diarization = _diarization,
      talk_ratio_seller = _talk_ratio_seller,
      talk_ratio_client = _talk_ratio_client,
      longest_monologue_sec = _longest_monologue_sec,
      interruptions_count = _interruptions_count,
      turns_count = _turns_count,
      diarized_at = now(),
      updated_at = now()
  WHERE id = _id;
END;
$function$
