-- Fix CWE-841: sync_quote_to_sale_status was unconditionally overwriting
-- the sale status, including downgrading 'won'/'completed' sales back to
-- 'lead' whenever the attached quote was edited back to 'draft'.
--
-- The corrected function:
--   1. Never downgrades a sale that has reached a terminal state
--      (won, completed, cancelled).
--   2. Only allows downgrade from 'closed' back to earlier quote-driven
--      stages when the sale is still in an open/editable pipeline state.
CREATE OR REPLACE FUNCTION public.sync_quote_to_sale_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_pipeline_status TEXT;
  v_current_sale_status TEXT;
BEGIN
  IF NEW.sale_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Read the current sale status to decide whether to allow sync
  SELECT status INTO v_current_sale_status
  FROM public.sales
  WHERE id = NEW.sale_id;

  -- Terminal states must never be overwritten by a quote status change
  IF v_current_sale_status IN ('won', 'completed', 'cancelled') THEN
    RETURN NEW;
  END IF;

  v_pipeline_status := CASE
    WHEN NEW.status = 'draft'    THEN 'lead'
    WHEN NEW.status = 'sent'     THEN 'proposal'
    WHEN NEW.status = 'approved' THEN 'closed'
    WHEN NEW.status = 'rejected' THEN 'cancelled'
    WHEN NEW.status = 'expired'  THEN 'cancelled'
    ELSE v_current_sale_status  -- unknown quote status → leave sale status unchanged
  END;

  -- Only write when the status actually needs to change
  IF v_pipeline_status IS DISTINCT FROM v_current_sale_status THEN
    UPDATE public.sales
    SET
      status     = v_pipeline_status,
      amount     = NEW.total_value,
      updated_at = now()
    WHERE id = NEW.sale_id;
  ELSE
    -- Status unchanged — still sync the amount
    UPDATE public.sales
    SET
      amount     = NEW.total_value,
      updated_at = now()
    WHERE id = NEW.sale_id;
  END IF;

  RETURN NEW;
END;
$function$;
