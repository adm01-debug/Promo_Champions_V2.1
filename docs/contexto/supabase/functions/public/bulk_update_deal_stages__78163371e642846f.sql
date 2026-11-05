CREATE OR REPLACE FUNCTION public.bulk_update_deal_stages(p_deal_ids uuid[], p_new_stage text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE deals
  SET stage = p_new_stage, updated_at = NOW()
  WHERE id = ANY(p_deal_ids);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$function$
