CREATE OR REPLACE FUNCTION public.add_league_weekly_xp(p_salesperson_id uuid, p_xp integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_sp_id uuid;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();
  IF v_caller_sp_id != p_salesperson_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_xp <= 0 OR p_xp > 10000 THEN
    RAISE EXCEPTION 'Invalid XP amount';
  END IF;

  UPDATE public.league_members SET
    weekly_xp = weekly_xp + p_xp,
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id;

  RETURN FOUND;
END;
$function$
