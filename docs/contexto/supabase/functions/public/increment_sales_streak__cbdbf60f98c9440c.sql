CREATE OR REPLACE FUNCTION public.increment_sales_streak(p_salesperson_id uuid)
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

  UPDATE public.sales_streaks SET
    current_streak = current_streak + 1,
    longest_streak = GREATEST(longest_streak, current_streak + 1),
    last_sale_date = CURRENT_DATE,
    updated_at = now()
  WHERE salesperson_id = p_salesperson_id;

  RETURN FOUND;
END;
$function$
