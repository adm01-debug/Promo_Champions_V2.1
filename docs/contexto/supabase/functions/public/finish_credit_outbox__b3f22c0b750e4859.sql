CREATE OR REPLACE FUNCTION public.finish_credit_outbox(p_ids uuid[], p_ok boolean, p_error text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  IF p_ids IS NULL OR array_length(p_ids, 1) IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.credit_outbox o
     SET status = CASE
                    WHEN p_ok THEN 'delivered'
                    WHEN o.attempts >= 5 THEN 'dead'
                    ELSE 'pending'
                  END,
         delivered_at = CASE WHEN p_ok THEN now() ELSE o.delivered_at END,
         last_error = CASE WHEN p_ok THEN NULL ELSE left(COALESCE(p_error, 'unknown'), 1000) END,
         next_attempt_at = CASE
                             WHEN p_ok OR o.attempts >= 5 THEN o.next_attempt_at
                             ELSE now()
                               + (least(power(2, greatest(o.attempts, 1))::int, 64) * interval '1 minute')
                           END,
         updated_at = now()
   WHERE o.id = ANY (p_ids);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$function$
