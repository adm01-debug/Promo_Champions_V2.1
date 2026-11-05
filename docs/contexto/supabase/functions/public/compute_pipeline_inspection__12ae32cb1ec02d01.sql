CREATE OR REPLACE FUNCTION public.compute_pipeline_inspection()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _r RECORD;
  _flags jsonb;
  _last_act timestamptz;
  _days_act integer;
  _days_stage integer;
  _count integer := 0;
BEGIN
  IF NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  FOR _r IN
    SELECT id, status, updated_at, salesperson_id
    FROM public.sales
    WHERE status NOT IN ('completed','lost','cancelled')
  LOOP
    _flags := '[]'::jsonb;
    _days_stage := EXTRACT(epoch FROM (now() - _r.updated_at))::integer / 86400;

    SELECT MAX(created_at) INTO _last_act FROM public.activities WHERE sale_id = _r.id;
    _days_act := CASE WHEN _last_act IS NULL THEN NULL ELSE EXTRACT(epoch FROM (now() - _last_act))::integer / 86400 END;

    IF _days_stage > 14 THEN _flags := _flags || jsonb_build_array(jsonb_build_object('flag','stale_stage','severity','high','days',_days_stage)); END IF;
    IF _days_act IS NULL OR _days_act > 7 THEN _flags := _flags || jsonb_build_array(jsonb_build_object('flag','no_recent_activity','severity','medium','days',_days_act)); END IF;
    IF NOT EXISTS (SELECT 1 FROM public.buying_committee_members WHERE sale_id = _r.id AND committee_role IN ('decision_maker','champion')) THEN
      _flags := _flags || jsonb_build_array(jsonb_build_object('flag','no_decision_maker','severity','high'));
    END IF;
    IF (SELECT COUNT(*) FROM public.buying_committee_members WHERE sale_id = _r.id) <= 1 THEN
      _flags := _flags || jsonb_build_array(jsonb_build_object('flag','single_threaded','severity','medium'));
    END IF;

    INSERT INTO public.pipeline_inspection_snapshots
      (sale_id, stage, days_in_stage, last_activity_at, days_since_activity, risk_flags)
    VALUES (_r.id, _r.status, _days_stage, _last_act, _days_act, _flags);
    _count := _count + 1;
  END LOOP;

  RETURN _count;
END;
$function$
