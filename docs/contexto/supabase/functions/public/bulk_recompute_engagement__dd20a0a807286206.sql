CREATE OR REPLACE FUNCTION public.bulk_recompute_engagement(_owner_id uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT cstp.contact_id, cstp.contact_type
    FROM public.contact_send_time_profile cstp
    WHERE cstp.updated_at >= now() - interval '30 days'
      AND (
        _owner_id IS NULL
        OR (
          cstp.contact_type = 'lead' AND EXISTS (
            SELECT 1 FROM public.sales s WHERE s.id = cstp.contact_id AND s.salesperson_id = _owner_id
          )
        )
        OR (
          cstp.contact_type = 'client' AND EXISTS (
            SELECT 1 FROM public.client_portfolio cp WHERE cp.client_id = cstp.contact_id AND cp.salesperson_id = _owner_id
          )
        )
      )
  LOOP
    PERFORM public.recompute_engagement_score(r.contact_id, r.contact_type);
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$function$
