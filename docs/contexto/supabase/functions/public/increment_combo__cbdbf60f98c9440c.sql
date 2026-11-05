CREATE OR REPLACE FUNCTION public.increment_combo(p_salesperson_id uuid)
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

  UPDATE public.combo_tracking SET
    actions_count = actions_count + 1,
    current_tier = LEAST(current_tier + 1, 10),
    current_multiplier = LEAST(current_multiplier + 0.1, 3.0),
    max_tier_today = GREATEST(max_tier_today, LEAST(current_tier + 1, 10)),
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id AND combo_date = CURRENT_DATE;

  RETURN FOUND;
END;
$function$
