CREATE OR REPLACE FUNCTION private.enrich_lead_data(lead_id uuid, new_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.sales
    SET 
        enrichment_data = enrichment_data || new_data,
        enrichment_status = 'completed',
        updated_at = now()
    WHERE id = lead_id;
END;
$function$
