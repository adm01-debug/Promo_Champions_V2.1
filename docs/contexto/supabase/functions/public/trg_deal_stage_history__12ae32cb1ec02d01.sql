CREATE OR REPLACE FUNCTION public.trg_deal_stage_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS NOT NULL THEN
      INSERT INTO public.deal_stage_history (sale_id, stage, entered_at)
      SELECT NEW.id, NEW.status::text, COALESCE(NEW.created_at, now())
      WHERE NOT EXISTS (
        SELECT 1 FROM public.deal_stage_history h
        WHERE h.sale_id = NEW.id
          AND h.stage = NEW.status::text
          AND h.entered_at = COALESCE(NEW.created_at, now())
      );
    END IF;
    RETURN NEW;
  END IF;

  -- Guarda NULL: sem ela, UPDATE status→NULL inseria stage NULL e a
  -- violação de NOT NULL revertia o UPDATE inteiro da venda.
  IF TG_OP = 'UPDATE'
     AND NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IS NOT NULL THEN
    UPDATE public.deal_stage_history
       SET exited_at = now()
     WHERE sale_id = NEW.id AND exited_at IS NULL;

    INSERT INTO public.deal_stage_history (sale_id, stage, entered_at)
    VALUES (NEW.id, NEW.status::text, now());
  END IF;

  RETURN NEW;
END;
$function$
