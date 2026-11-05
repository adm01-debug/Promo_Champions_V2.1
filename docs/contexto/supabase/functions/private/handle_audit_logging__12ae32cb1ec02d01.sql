CREATE OR REPLACE FUNCTION private.handle_audit_logging()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    actor_id UUID;
    actor_email TEXT;
    old_data JSONB;
    new_data JSONB;
    changed_fields JSONB;
BEGIN
    -- Try to get the current user
    actor_id := auth.uid();
    
    -- Prepare data for audit
    IF (TG_OP = 'UPDATE') THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        
        -- Compute changes (simplified)
        SELECT jsonb_object_agg(key, value) INTO changed_fields
        FROM jsonb_each(new_data)
        WHERE value IS DISTINCT FROM old_data -> key;
        
        INSERT INTO public.audit_logs (
            action,
            entity_type,
            entity_id,
            actor_id,
            changes
        ) VALUES (
            'update',
            TG_TABLE_NAME,
            OLD.id::text,
            actor_id,
            changed_fields
        );
    END IF;
    
    RETURN NEW;
END;
$function$
