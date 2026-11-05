CREATE OR REPLACE FUNCTION public.fn_purge_rollback_snapshots()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _deleted INTEGER;
BEGIN
  DELETE FROM public.db_rollback_snapshots WHERE captured_at < now() - INTERVAL '30 days';
  GET DIAGNOSTICS _deleted = ROW_COUNT;
  RETURN _deleted;
END;
$function$
