CREATE OR REPLACE FUNCTION public.cleanup_deleted_records()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  DELETE FROM deals WHERE deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM clients WHERE deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM activities WHERE deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM tasks WHERE deleted_at < NOW() - INTERVAL '90 days';
END;
$function$
