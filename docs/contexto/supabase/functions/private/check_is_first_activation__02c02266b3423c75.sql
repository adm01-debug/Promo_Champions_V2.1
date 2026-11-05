CREATE OR REPLACE FUNCTION private.check_is_first_activation(p_client_id uuid, p_sale_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.sales
    WHERE client_id = p_client_id
    AND (status = 'completed' OR status = 'won' OR deal_status = 'completed')
    AND id != p_sale_id;
    
    RETURN v_count = 0;
END;
$function$
