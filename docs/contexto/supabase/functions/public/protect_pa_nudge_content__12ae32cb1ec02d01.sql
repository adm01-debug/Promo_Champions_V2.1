CREATE OR REPLACE FUNCTION public.protect_pa_nudge_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    RAISE EXCEPTION 'nudge.content is immutable';
  END IF;
  IF NEW.salesperson_id IS DISTINCT FROM OLD.salesperson_id THEN
    RAISE EXCEPTION 'nudge.salesperson_id is immutable';
  END IF;
  -- Auto-preenche feedback_at quando feedback muda de pending -> accepted/dismissed
  IF OLD.feedback = 'pending' AND NEW.feedback IN ('accepted','dismissed') AND NEW.feedback_at IS NULL THEN
    NEW.feedback_at = now();
  END IF;
  RETURN NEW;
END;
$function$
