CREATE OR REPLACE FUNCTION public.assign_task_to_squad(_catalog_id uuid, _squad_id uuid, _due_date date DEFAULT NULL::date, _recurrence text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _count INTEGER := 0;
  _parent_id UUID := gen_random_uuid();
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign tasks to squads';
  END IF;

  INSERT INTO public.task_assignments (catalog_id, assigned_to, assigned_by, due_date, squad_id, recurrence_rule, parent_recurrence_id)
  SELECT _catalog_id, sm.user_id, auth.uid(), _due_date, _squad_id, _recurrence,
         CASE WHEN _recurrence IS NOT NULL THEN _parent_id ELSE NULL END
  FROM public.squad_members sm
  WHERE sm.squad_id = _squad_id;

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$function$
