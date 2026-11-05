CREATE OR REPLACE FUNCTION private.trigger_recalculate_deal_health()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sale_id UUID;
BEGIN
  -- Get sale_id from the recording
  SELECT sale_id INTO v_sale_id 
  FROM public.call_recordings 
  WHERE id = NEW.recording_id;

  IF v_sale_id IS NOT NULL THEN
    UPDATE public.deal_health_scores
    SET calculated_at = now() - interval '1 day' -- Mark as stale
    WHERE sale_id = v_sale_id;
  END IF;
  
  RETURN NEW;
END;
$function$
