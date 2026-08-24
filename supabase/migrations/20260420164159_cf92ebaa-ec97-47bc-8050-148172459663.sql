-- Trigger 1: XP ao concluir tarefa de cadência de orçamento
CREATE OR REPLACE FUNCTION public.award_xp_on_quote_cadence_task_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_salesperson_id uuid;
  v_quote_id uuid;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed') THEN
    SELECT pc.salesperson_id, pc.quote_id
      INTO v_salesperson_id, v_quote_id
      FROM public.prospect_cadences pc
     WHERE pc.id = NEW.prospect_cadence_id;

    IF v_quote_id IS NOT NULL AND v_salesperson_id IS NOT NULL THEN
      PERFORM public.add_salesperson_xp(v_salesperson_id, 15, 'quote_cadence_task');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_xp_on_quote_cadence_task_complete ON public.cadence_tasks;
CREATE TRIGGER trg_award_xp_on_quote_cadence_task_complete
AFTER UPDATE ON public.cadence_tasks
FOR EACH ROW
EXECUTE FUNCTION public.award_xp_on_quote_cadence_task_complete();

-- Trigger 2: XP ao orçamento ser aprovado (se houve cadência ativa)
CREATE OR REPLACE FUNCTION public.award_xp_on_quote_approved_via_cadence()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_salesperson_id uuid;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved') THEN
    SELECT pc.salesperson_id
      INTO v_salesperson_id
      FROM public.prospect_cadences pc
     WHERE pc.quote_id = NEW.id
     ORDER BY pc.started_at DESC
     LIMIT 1;

    IF v_salesperson_id IS NOT NULL THEN
      PERFORM public.add_salesperson_xp(v_salesperson_id, 50, 'quote_approved_via_cadence');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_xp_on_quote_approved_via_cadence ON public.quotes;
CREATE TRIGGER trg_award_xp_on_quote_approved_via_cadence
AFTER UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.award_xp_on_quote_approved_via_cadence();