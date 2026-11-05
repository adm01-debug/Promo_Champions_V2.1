CREATE OR REPLACE FUNCTION private.auto_pause_cadence_on_response()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.direction = 'inbound' AND NEW.deal_id IS NOT NULL THEN
    UPDATE public.prospect_cadences
    SET status = 'paused',
        paused_reason = 'response_detected:' || COALESCE(NEW.channel, 'unknown'),
        paused_at = now(),
        updated_at = now()
    WHERE sale_id = NEW.deal_id
      AND status = 'active';

    -- Marca tarefas pendentes como skipped automaticamente
    UPDATE public.cadence_tasks
    SET status = 'skipped',
        notes = COALESCE(notes, '') || ' [auto-skipped: prospect respondeu via ' || COALESCE(NEW.channel, 'canal') || ']'
    WHERE status = 'pending'
      AND prospect_cadence_id IN (
        SELECT id FROM public.prospect_cadences
        WHERE sale_id = NEW.deal_id AND status = 'paused' AND paused_reason LIKE 'response_detected%'
      )
      AND scheduled_date >= CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$function$
