CREATE OR REPLACE FUNCTION public.increment_goal_progress(p_goal_id uuid, p_increment integer DEFAULT 1)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_sp_id uuid;
  v_goal_sp_id uuid;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();
  SELECT salesperson_id INTO v_goal_sp_id FROM public.progressive_goals WHERE id = p_goal_id;
  
  IF v_caller_sp_id != v_goal_sp_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_increment <= 0 OR p_increment > 100 THEN
    RAISE EXCEPTION 'Invalid increment (must be 1-100)';
  END IF;

  UPDATE public.progressive_goals SET
    current_progress = current_progress + p_increment,
    updated_at = now()
  WHERE id = p_goal_id;

  RETURN FOUND;
END;
$function$
