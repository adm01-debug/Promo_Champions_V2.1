CREATE OR REPLACE FUNCTION public.log_data_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO data_access_log (user_id, table_name, record_id, action)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$
