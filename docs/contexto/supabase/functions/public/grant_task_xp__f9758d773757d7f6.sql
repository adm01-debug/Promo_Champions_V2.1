CREATE OR REPLACE FUNCTION public.grant_task_xp(_assignment_id uuid, _xp_amount integer, _reason text DEFAULT 'Task approved'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id UUID;
  _adjustment_id UUID;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can grant XP';
  END IF;

  SELECT assigned_to INTO _user_id
  FROM public.task_assignments
  WHERE id = _assignment_id;

  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Assignment not found';
  END IF;

  UPDATE public.task_assignments
  SET status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      xp_granted = _xp_amount
  WHERE id = _assignment_id;

  INSERT INTO public.xp_adjustments(user_id, amount, reason, source, related_assignment_id, adjusted_by)
  VALUES (_user_id, _xp_amount, _reason, 'task_approval', _assignment_id, auth.uid())
  RETURNING id INTO _adjustment_id;

  RETURN _adjustment_id;
END;
$function$
