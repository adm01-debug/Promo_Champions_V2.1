CREATE OR REPLACE FUNCTION public.merge_clients(
    target_id UUID,
    duplicate_ids UUID[],
    preferred_fields JSONB DEFAULT '{}'::JSONB
) RETURNS VOID AS $$
DECLARE
    dup_id UUID;
    field_key TEXT;
    field_value TEXT;
BEGIN
    -- 1. Update preferred fields if provided
    IF preferred_fields <> '{}'::JSONB THEN
        FOR field_key, field_value IN SELECT * FROM jsonb_each_text(preferred_fields)
        LOOP
            EXECUTE format('UPDATE public.clients SET %I = %L WHERE id = %L', field_key, field_value, target_id);
        END LOOP;
    END IF;

    -- 2. Reassign related records
    FOREACH dup_id IN ARRAY duplicate_ids
    LOOP
        -- Sales
        UPDATE public.sales SET client_id = target_id WHERE client_id = dup_id;
        
        -- Tasks
        UPDATE public.tasks SET client_id = target_id WHERE client_id = dup_id;
        
        -- Activities (if exists)
        BEGIN
            UPDATE public.activities SET client_id = target_id WHERE client_id = dup_id;
        EXCEPTION WHEN OTHERS THEN
            NULL; -- Table might not have client_id or not exist
        END;

        -- Cadence Enrollments (if exists)
        BEGIN
            UPDATE public.cadence_enrollments SET client_id = target_id WHERE client_id = dup_id;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
        
        -- Delete duplicate
        DELETE FROM public.clients WHERE id = dup_id;
    END LOOP;

    -- 3. Recalculate total_value for target
    UPDATE public.clients 
    SET total_value = (SELECT COALESCE(SUM(amount), 0) FROM public.sales WHERE client_id = target_id AND deal_status = 'completed')
    WHERE id = target_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
