CREATE OR REPLACE FUNCTION private.check_is_first_sale(p_client_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    sale_count INTEGER;
BEGIN
    SELECT count(*) INTO sale_count FROM public.sales WHERE client_id = p_client_id AND status = 'completed';
    RETURN sale_count = 0; -- If 0, the current sale being processed (before completion) is the first
END;
$function$
