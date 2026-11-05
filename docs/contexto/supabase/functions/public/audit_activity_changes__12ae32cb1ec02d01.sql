CREATE OR REPLACE FUNCTION public.audit_activity_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.activity_audit_logs (activity_id, changed_by, old_data, new_data, action)
        VALUES (OLD.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW), 'UPDATE');
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.activity_audit_logs (activity_id, changed_by, old_data, action)
        VALUES (OLD.id, auth.uid(), to_jsonb(OLD), 'DELETE');
    END IF;
    RETURN NEW;
END;
$function$
