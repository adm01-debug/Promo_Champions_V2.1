CREATE OR REPLACE FUNCTION public.audit_trigger_func()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  old_data JSONB;
  new_data JSONB;
  excluded_cols TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF TG_ARGV[0] IS NOT NULL THEN
    excluded_cols := TG_ARGV[0]::TEXT[];
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);

    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id::TEXT::uuid, old_data, new_data);

    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    old_data := to_jsonb(OLD);

    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id::TEXT::uuid, old_data);

    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    new_data := to_jsonb(NEW);

    INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id::TEXT::uuid, new_data);

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$function$
