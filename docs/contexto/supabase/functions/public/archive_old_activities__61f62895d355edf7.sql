CREATE OR REPLACE FUNCTION public.archive_old_activities(p_days_old integer DEFAULT 365)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_archived_count INTEGER;
BEGIN
  WITH archived AS (
    DELETE FROM activities
    WHERE created_at < NOW() - (p_days_old || ' days')::INTERVAL
    RETURNING *
  )
  INSERT INTO activities_archive
  SELECT * FROM archived;
  
  GET DIAGNOSTICS v_archived_count = ROW_COUNT;
  
  RETURN v_archived_count;
END;
$function$
