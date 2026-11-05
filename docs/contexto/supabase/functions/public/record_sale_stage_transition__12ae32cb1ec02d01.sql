CREATE OR REPLACE FUNCTION public.record_sale_stage_transition()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS NOT NULL THEN
      INSERT INTO public.deal_stage_transitions (sale_id, from_stage, to_stage, entered_at)
      VALUES (NEW.id, NULL, NEW.status::text, COALESCE(NEW.created_at, now()));
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    UPDATE public.deal_stage_transitions
       SET exited_at = now()
     WHERE sale_id = NEW.id AND exited_at IS NULL;

    INSERT INTO public.deal_stage_transitions (sale_id, from_stage, to_stage, entered_at)
    VALUES (NEW.id, OLD.status::text, NEW.status::text, now());
  END IF;

  RETURN NEW;
END;
$function$
