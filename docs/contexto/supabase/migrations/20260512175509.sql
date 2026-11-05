CREATE OR REPLACE FUNCTION public.merge_clients(target_id uuid, duplicate_ids uuid[], preferred_fields jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    dup_id UUID;
    field_key TEXT;
    field_value TEXT;
BEGIN
    -- 1. Update preferred fields if provided
    IF preferred_fields <> '{}'::JSONB THEN
        FOR field_key, field_value IN SELECT * FROM jsonb_each_text(preferred_fields)
        LOOP
            -- Only update if field exists in clients table to prevent errors
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = field_key) THEN
                EXECUTE format('UPDATE public.clients SET %I = %L WHERE id = %L', field_key, field_value, target_id);
            END IF;
        END LOOP;
    END IF;

    -- 2. Reassign related records
    FOREACH dup_id IN ARRAY duplicate_ids
    LOOP
        -- Core tables
        UPDATE public.sales SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.tasks SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.activities SET client_id = target_id WHERE client_id = dup_id;
        
        -- Extended analytics/engagement tables
        UPDATE public.agenda_events SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.call_recordings SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.conversation_analyses SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.lead_detailed_logs SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.lead_routing_log SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.client_interactions SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.icp_data SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.client_portfolio SET client_id = target_id WHERE client_id = dup_id;
        UPDATE public.client_purchase_seasonality SET client_id = target_id WHERE client_id = dup_id;
        
        -- Conditional tables (those that might not exist in all environments)
        BEGIN
            EXECUTE 'UPDATE public.cadence_enrollments SET client_id = $1 WHERE client_id = $2' USING target_id, dup_id;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- Delete duplicate
        DELETE FROM public.clients WHERE id = dup_id;
    END LOOP;

    -- 3. Recalculate total_value for target (Sum of won sales)
    UPDATE public.clients 
    SET total_value = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.sales 
        WHERE client_id = target_id 
        AND (status = 'won' OR status = 'completed' OR deal_status::text IN ('won', 'completed'))
    )
    WHERE id = target_id;

END;
$function$;
