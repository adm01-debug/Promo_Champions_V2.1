ALTER TABLE public.prospect_cadences
  ADD COLUMN IF NOT EXISTS paused_reason TEXT,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- Trigger: ao inserir interação inbound, pausa cadências ativas daquele deal
CREATE OR REPLACE FUNCTION public.auto_pause_cadence_on_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

DROP TRIGGER IF EXISTS trg_auto_pause_cadence_on_response ON public.channel_interactions;
CREATE TRIGGER trg_auto_pause_cadence_on_response
  AFTER INSERT ON public.channel_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_pause_cadence_on_response();

-- Helper RPC: estatísticas de auto-pauses
CREATE OR REPLACE FUNCTION public.get_auto_paused_count(_days INT DEFAULT 7)
RETURNS INT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INT
  FROM public.prospect_cadences
  WHERE paused_reason LIKE 'response_detected%'
    AND paused_at >= now() - (_days || ' days')::INTERVAL
$$;