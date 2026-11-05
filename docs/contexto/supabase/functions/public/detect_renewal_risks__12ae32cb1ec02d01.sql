CREATE OR REPLACE FUNCTION public.detect_renewal_risks()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _updated int := 0;
BEGIN
  UPDATE public.renewals
  SET status = 'at_risk', updated_at = now()
  WHERE status = 'upcoming'
    AND renewal_date <= CURRENT_DATE + INTERVAL '60 days'
    AND account_id IN (
      SELECT a.id FROM public.accounts a
      WHERE a.health_status IN ('critical','at_risk')
    );
  GET DIAGNOSTICS _updated = ROW_COUNT;

  UPDATE public.renewals
  SET status = 'churned', updated_at = now()
  WHERE status IN ('upcoming','at_risk')
    AND renewal_date < CURRENT_DATE - INTERVAL '7 days'
    AND auto_renew = false;

  RETURN _updated;
END;
$function$
