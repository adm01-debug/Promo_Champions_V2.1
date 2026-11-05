CREATE OR REPLACE FUNCTION public.log_soft_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    INSERT INTO audit_log (
      table_name,
      record_id,
      action,
      user_id,
      changes,
      reason
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'SOFT_DELETE',
      NEW.deleted_by,
      jsonb_build_object(
        'deleted_at', NEW.deleted_at,
        'reason', NEW.delete_reason
      ),
      NEW.delete_reason
    );
  END IF;
  
  RETURN NEW;
END;
$function$
