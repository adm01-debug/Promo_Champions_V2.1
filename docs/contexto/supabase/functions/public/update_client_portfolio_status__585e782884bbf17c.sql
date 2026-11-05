CREATE OR REPLACE FUNCTION public.update_client_portfolio_status(p_portfolio_id uuid, p_status text, p_last_purchase_date date DEFAULT NULL::date)
 RETURNS client_portfolio
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_row public.client_portfolio%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT * INTO v_row
  FROM public.client_portfolio
  WHERE id = p_portfolio_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'portfolio_not_found' USING ERRCODE = 'P0002';
  END IF;

  IF v_row.salesperson_id IS DISTINCT FROM public.get_current_salesperson_id()
     AND NOT public.is_admin_or_manager(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.client_portfolio
  SET status = p_status,
      last_purchase_date = COALESCE(p_last_purchase_date, last_purchase_date)
  WHERE id = p_portfolio_id
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$function$
