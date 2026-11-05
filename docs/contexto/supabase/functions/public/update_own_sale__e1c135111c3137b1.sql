CREATE OR REPLACE FUNCTION public.update_own_sale(p_sale_id uuid, p_client_name text DEFAULT NULL::text, p_product_name text DEFAULT NULL::text, p_category text DEFAULT NULL::text, p_source text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_salesperson_id uuid;
BEGIN
  v_salesperson_id := get_current_salesperson_id();
  IF v_salesperson_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated as a salesperson';
  END IF;

  -- Only allow updating own sales
  UPDATE public.sales SET
    client_name = COALESCE(p_client_name, client_name),
    product_name = COALESCE(p_product_name, product_name),
    category = COALESCE(p_category, category),
    source = COALESCE(p_source, source),
    updated_at = now()
  WHERE id = p_sale_id
    AND salesperson_id = v_salesperson_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale not found or not owned by you';
  END IF;

  RETURN true;
END;
$function$
