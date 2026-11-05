CREATE OR REPLACE FUNCTION public.next_dialer_item(_queue_id uuid)
 RETURNS TABLE(item_id uuid, sale_id uuid, score numeric, queue_position integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_item_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.dialer_queues q WHERE q.id = _queue_id
    AND (q.owner_id = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager'))) THEN
    RAISE EXCEPTION 'Not authorized for queue %', _queue_id;
  END IF;

  SELECT i.id INTO v_item_id FROM public.dialer_queue_items i
  WHERE i.queue_id = _queue_id AND i.status = 'pending'
    AND (i.snooze_until IS NULL OR i.snooze_until <= now())
  ORDER BY i.queue_position ASC, i.score DESC
  LIMIT 1 FOR UPDATE SKIP LOCKED;

  IF v_item_id IS NULL THEN RETURN; END IF;

  UPDATE public.dialer_queue_items SET status = 'calling' WHERE id = v_item_id;

  RETURN QUERY SELECT i.id, i.sale_id, i.score, i.queue_position
    FROM public.dialer_queue_items i WHERE i.id = v_item_id;
END;
$function$
