CREATE OR REPLACE FUNCTION private.trg_activities_auto_pause_sequences()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _enr record;
BEGIN
  -- Only react to inbound-style activities
  IF NEW.activity_type::text NOT IN ('reply','email_received','whatsapp_inbound','inbound_message') THEN
    RETURN NEW;
  END IF;

  IF NEW.sale_id IS NULL THEN
    RETURN NEW;
  END IF;

  FOR _enr IN
    SELECT se.id
    FROM public.sequence_enrollments se
    JOIN public.sequences s ON s.id = se.sequence_id
    WHERE se.contact_id = NEW.sale_id
      AND se.contact_type = 'lead'
      AND se.status IN ('active','scheduled')
      AND se.auto_paused_at IS NULL
      AND s.auto_pause_on_reply = true
  LOOP
    PERFORM public.auto_pause_enrollment(_enr.id, 'manual_activity');
  END LOOP;

  RETURN NEW;
END;
$function$
