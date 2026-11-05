CREATE OR REPLACE FUNCTION public.admin_capture_rollback_snapshot()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _id UUID;
  _commit BIGINT;
  _rollback BIGINT;
  _deadlocks BIGINT;
  _temp_files BIGINT;
  _temp_bytes BIGINT;
BEGIN
  SELECT xact_commit, xact_rollback, deadlocks, temp_files, temp_bytes
    INTO _commit, _rollback, _deadlocks, _temp_files, _temp_bytes
  FROM pg_stat_database
  WHERE datname = current_database();

  INSERT INTO public.db_rollback_snapshots (
    xact_commit, xact_rollback, deadlocks, temp_files, temp_bytes
  ) VALUES (_commit, _rollback, _deadlocks, _temp_files, _temp_bytes)
  RETURNING id INTO _id;

  RETURN _id;
END;
$function$
