-- Ensure handle_audit_logging function exists
CREATE OR REPLACE FUNCTION public.handle_audit_logging()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers to relevant tables
DROP TRIGGER IF EXISTS audit_sales_changes ON public.sales;
CREATE TRIGGER audit_sales_changes
AFTER UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_audit_logging();

-- Activities audit (assuming activities table name based on context)
-- Since activities name might vary, I'll stick to 'sales' and 'tasks' which are confirmed
DROP TRIGGER IF EXISTS audit_tasks_changes ON public.tasks;
CREATE TRIGGER audit_tasks_changes
AFTER UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_audit_logging();
