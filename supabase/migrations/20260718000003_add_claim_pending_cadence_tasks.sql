-- Atomic task claim for the cadence processor (fixes CWE-362 race condition).
--
-- FOR UPDATE SKIP LOCKED ensures that two concurrent invocations of
-- process-cadence-tasks cannot claim the same tasks, eliminating duplicate
-- message sends.
--
-- The JOIN on prospect_cadences filters to status='active' rows only,
-- so paused/cancelled cadences are never started (CRITICAL #5 fix).
--
-- Returns the IDs of the rows that were actually claimed.
CREATE OR REPLACE FUNCTION public.claim_pending_cadence_tasks(
  p_today  date,
  p_limit  integer DEFAULT 20
)
RETURNS TABLE(task_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH claimed AS (
    SELECT ct.id
    FROM public.cadence_tasks ct
    JOIN public.prospect_cadences pc ON pc.id = ct.prospect_cadence_id
    WHERE ct.status     = 'pending'
      AND ct.task_type  = 'automatic'
      AND ct.scheduled_date <= p_today
      AND pc.status     = 'active'   -- never fire for paused/cancelled cadences
    ORDER BY ct.scheduled_date ASC
    LIMIT p_limit
    FOR UPDATE OF ct SKIP LOCKED    -- atomic; concurrent runners skip locked rows
  )
  UPDATE public.cadence_tasks
  SET    status = 'processing',
         updated_at = now()
  FROM   claimed
  WHERE  cadence_tasks.id = claimed.id
  RETURNING cadence_tasks.id AS task_id;
END;
$$;
