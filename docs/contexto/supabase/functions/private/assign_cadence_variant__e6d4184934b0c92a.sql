CREATE OR REPLACE FUNCTION private.assign_cadence_variant(_ab_test_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _split INT;
  _count_a INT;
  _count_b INT;
  _total INT;
  _ratio_a NUMERIC;
BEGIN
  SELECT traffic_split INTO _split FROM public.cadence_ab_tests WHERE id = _ab_test_id;
  IF _split IS NULL THEN RETURN 'a'; END IF;

  SELECT
    COUNT(*) FILTER (WHERE variant = 'a'),
    COUNT(*) FILTER (WHERE variant = 'b')
  INTO _count_a, _count_b
  FROM public.cadence_ab_assignments
  WHERE ab_test_id = _ab_test_id;

  _total := _count_a + _count_b;
  IF _total = 0 THEN RETURN 'a'; END IF;

  _ratio_a := (_count_a::NUMERIC / _total::NUMERIC) * 100;

  IF _ratio_a < _split THEN
    RETURN 'a';
  ELSE
    RETURN 'b';
  END IF;
END;
$function$
