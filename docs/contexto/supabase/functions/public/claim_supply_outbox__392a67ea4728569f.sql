CREATE OR REPLACE FUNCTION public.claim_supply_outbox(p_limit integer DEFAULT 25)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_rows jsonb;
BEGIN
  WITH due AS (
    SELECT o.id
      FROM public.supply_outbox o
     WHERE (
             o.status = 'pending'
             AND o.next_attempt_at <= now()
           )
        OR (
             o.status = 'processing'
             AND o.updated_at < now() - interval '5 minutes'
           )
     ORDER BY o.next_attempt_at
     LIMIT GREATEST(COALESCE(p_limit, 25), 1)
       FOR UPDATE SKIP LOCKED
  ), claimed AS (
    UPDATE public.supply_outbox o
       SET status = 'processing',
           attempts = o.attempts + 1,
           updated_at = now()
      FROM due
     WHERE o.id = due.id
    RETURNING o.id, o.event, o.payload, o.attempts
  )
  SELECT COALESCE(
           jsonb_agg(
             jsonb_build_object(
               'id', c.id,
               'event', c.event,
               'payload', c.payload,
               'attempts', c.attempts
             )
           ),
           '[]'::jsonb
         )
    INTO v_rows
    FROM claimed c;

  RETURN v_rows;
END;
$function$
