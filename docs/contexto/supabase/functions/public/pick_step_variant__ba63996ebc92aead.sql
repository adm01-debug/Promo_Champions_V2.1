CREATE OR REPLACE FUNCTION public.pick_step_variant(_step_id uuid)
 RETURNS TABLE(variant_id uuid, label text, subject text, body text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _total int; _r numeric; _cum int := 0; _row record;
BEGIN
  SELECT COALESCE(SUM(traffic_weight),0) INTO _total FROM public.sequence_step_variants WHERE step_id = _step_id;
  IF _total = 0 THEN RETURN; END IF;
  _r := random() * _total;
  FOR _row IN
    SELECT v.id, v.label, v.subject, v.body, v.traffic_weight
    FROM public.sequence_step_variants v WHERE v.step_id = _step_id ORDER BY v.label
  LOOP
    _cum := _cum + _row.traffic_weight;
    IF _r <= _cum THEN
      RETURN QUERY SELECT _row.id, _row.label, _row.subject, _row.body;
      RETURN;
    END IF;
  END LOOP;
END;
$function$
