CREATE OR REPLACE FUNCTION private.log_lead_stage_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.funnel_stage IS DISTINCT FROM NEW.funnel_stage THEN
    INSERT INTO public.lead_detailed_logs (client_id, event_type, action, details, created_by)
    VALUES (
      NEW.id, 
      'transition', 
      'Stage Change', 
      jsonb_build_object('from', OLD.funnel_stage, 'to', NEW.funnel_stage),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$function$
