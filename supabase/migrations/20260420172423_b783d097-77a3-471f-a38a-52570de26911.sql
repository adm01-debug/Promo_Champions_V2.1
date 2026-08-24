
CREATE OR REPLACE FUNCTION public.enroll_quote_in_cadence(_quote_id uuid, _cadence_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_enrollment_id uuid;
  v_salesperson_id uuid;
  v_first_day int;
  v_first_date date;
BEGIN
  SELECT sp.id INTO v_salesperson_id
  FROM public.quotes q
  LEFT JOIN public.salespeople sp ON sp.auth_user_id = q.created_by
  WHERE q.id = _quote_id;

  SELECT COALESCE(MIN(day_number), 1) INTO v_first_day
  FROM public.cadence_steps WHERE cadence_id = _cadence_id;

  v_first_date := CURRENT_DATE + (v_first_day - 1);

  INSERT INTO public.prospect_cadences (
    quote_id, cadence_id, salesperson_id, enrollment_source, next_action_date
  ) VALUES (
    _quote_id, _cadence_id, v_salesperson_id, 'manual', v_first_date
  )
  RETURNING id INTO v_enrollment_id;

  INSERT INTO public.cadence_tasks (prospect_cadence_id, cadence_step_id, scheduled_date)
  SELECT v_enrollment_id, cs.id, CURRENT_DATE + (cs.day_number - 1)
  FROM public.cadence_steps cs
  WHERE cs.cadence_id = _cadence_id
  ORDER BY cs.step_order;

  RETURN v_enrollment_id;
END;
$function$;
