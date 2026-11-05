CREATE OR REPLACE FUNCTION public.update_call_recording_summary(_recording_id uuid, _summary text, _action_items jsonb, _decisions jsonb, _objections jsonb, _next_steps jsonb, _key_topics text[], _sentiment text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_owner uuid;
  v_caller_sp uuid;
BEGIN
  SELECT salesperson_id INTO v_owner FROM public.call_recordings WHERE id = _recording_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Recording not found';
  END IF;

  v_caller_sp := public.get_current_salesperson_id();
  IF v_owner <> v_caller_sp AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF _sentiment IS NOT NULL AND _sentiment NOT IN ('positive','neutral','negative','mixed') THEN
    RAISE EXCEPTION 'Invalid sentiment value';
  END IF;

  UPDATE public.call_recordings SET
    summary = _summary,
    action_items = COALESCE(_action_items, '[]'::jsonb),
    decisions = COALESCE(_decisions, '[]'::jsonb),
    objections_summary = COALESCE(_objections, '[]'::jsonb),
    next_steps = COALESCE(_next_steps, '[]'::jsonb),
    key_topics = COALESCE(_key_topics, ARRAY[]::text[]),
    sentiment = _sentiment,
    summarized_at = now(),
    status = CASE WHEN status IN ('transcribed','analyzing') THEN 'ready' ELSE status END,
    updated_at = now()
  WHERE id = _recording_id;

  RETURN true;
END;
$function$
