CREATE OR REPLACE FUNCTION public.archive_old_data(days_old integer)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  archived_count INT;
BEGIN
  WITH archived AS (
    UPDATE deals
    SET deleted_at = NOW()
    WHERE status = 'lost'
      AND updated_at < NOW() - (days_old || ' days')::INTERVAL
      AND deleted_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  RETURN archived_count;
END;
$function$
