CREATE OR REPLACE FUNCTION private.add_salesperson_xp(p_salesperson_id uuid, p_xp_amount integer, p_source text DEFAULT 'system'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_sp_id uuid;
  v_level_base numeric;
BEGIN
  v_caller_sp_id := get_current_salesperson_id();

  -- Only the salesperson themselves or admin/manager can add XP
  IF v_caller_sp_id != p_salesperson_id AND NOT is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Validate positive increment
  IF p_xp_amount <= 0 OR p_xp_amount > 10000 THEN
    RAISE EXCEPTION 'Invalid XP amount (must be 1-10000)';
  END IF;

  v_level_base := public.get_app_config_number('xp.level_base', 1000);

  UPDATE public.salesperson_xp SET
    total_xp = total_xp + p_xp_amount,
    current_level = GREATEST(current_level, 1 + floor((total_xp + p_xp_amount) / v_level_base)::int),
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id;

  RETURN FOUND;
END;
$function$
