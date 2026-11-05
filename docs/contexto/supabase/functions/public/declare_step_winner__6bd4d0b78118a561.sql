CREATE OR REPLACE FUNCTION public.declare_step_winner(_step_id uuid, _variant_label text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _v record;
BEGIN
  IF NOT public.user_owns_sequence_step(_step_id) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO _v FROM public.sequence_step_variants WHERE step_id = _step_id AND label = _variant_label;
  IF NOT FOUND THEN RAISE EXCEPTION 'Variant not found'; END IF;
  UPDATE public.sequence_steps SET subject = _v.subject, body = _v.body WHERE id = _step_id;
  DELETE FROM public.sequence_step_variants WHERE step_id = _step_id;
  RETURN true;
END;
$function$
