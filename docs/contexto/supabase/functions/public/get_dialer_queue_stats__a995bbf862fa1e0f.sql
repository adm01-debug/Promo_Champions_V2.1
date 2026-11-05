CREATE OR REPLACE FUNCTION public.get_dialer_queue_stats(_queue_id uuid)
 RETURNS TABLE(pending_count integer, calling_count integer, done_count integer, skipped_count integer, snoozed_count integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COUNT(*) FILTER (WHERE status='pending')::int,
    COUNT(*) FILTER (WHERE status='calling')::int,
    COUNT(*) FILTER (WHERE status='done')::int,
    COUNT(*) FILTER (WHERE status='skipped')::int,
    COUNT(*) FILTER (WHERE status='snoozed')::int
  FROM public.dialer_queue_items WHERE queue_id = _queue_id;
$function$
