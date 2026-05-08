-- Add time window to funnel rules
ALTER TABLE public.cadence_funnel_rules 
ADD COLUMN IF NOT EXISTS time_window_hours INTEGER DEFAULT 24;

-- Function to process lead intent events and trigger transitions/tasks
CREATE OR REPLACE FUNCTION public.process_lead_intent_event(
    p_prospect_cadence_id UUID,
    p_event_type TEXT,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_prospect RECORD;
    v_rule RECORD;
    v_event_count INTEGER;
    v_transitioned BOOLEAN := FALSE;
    v_result JSONB;
BEGIN
    -- Get prospect info
    SELECT pc.*, c.name as cadence_name, pc.salesperson_id
    INTO v_prospect
    FROM prospect_cadences pc
    JOIN cadences c ON c.id = pc.cadence_id
    WHERE pc.id = p_prospect_cadence_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('error', 'Prospect not found');
    END IF;

    -- Log the event
    INSERT INTO intent_audit_logs (lead_id, event_type, details)
    VALUES (p_prospect_cadence_id, p_event_type, p_details);

    -- Check for matching rules for the current stage
    FOR v_rule IN 
        SELECT * FROM cadence_funnel_rules 
        WHERE is_active = true 
          AND from_stage = v_prospect.funnel_stage 
          AND condition_type = p_event_type
    LOOP
        -- Count occurrences within time window
        SELECT count(*)
        INTO v_event_count
        FROM intent_audit_logs
        WHERE lead_id = p_prospect_cadence_id
          AND event_type = p_event_type
          AND created_at >= now() - (v_rule.time_window_hours || ' hours')::interval;

        -- Check if condition is met
        IF v_event_count >= v_rule.condition_value THEN
            -- Update prospect stage
            UPDATE prospect_cadences
            SET funnel_stage = v_rule.to_stage,
                updated_at = now()
            WHERE id = p_prospect_cadence_id;

            v_transitioned := TRUE;

            -- If transitioned to "high_interest", create a "Ligar Agora" task
            IF v_rule.to_stage = 'high_interest' THEN
                -- Create task
                INSERT INTO cadence_tasks (
                    prospect_cadence_id,
                    scheduled_date,
                    status,
                    notes
                ) VALUES (
                    p_prospect_cadence_id,
                    CURRENT_DATE,
                    'pending',
                    'Gatilho de Intenção: ' || p_event_type || ' (' || v_event_count || ' vezes)'
                );

                -- Notify salesperson
                IF v_prospect.salesperson_id IS NOT NULL THEN
                    INSERT INTO notifications (
                        user_id,
                        type,
                        category,
                        priority,
                        title,
                        message,
                        icon,
                        metadata
                    ) VALUES (
                        v_prospect.salesperson_id,
                        'alert',
                        'sales',
                        'high',
                        '🔥 Lead com Alto Interesse!',
                        'O lead ' || substring(p_prospect_cadence_id::text, 1, 8) || ' realizou ' || v_event_count || ' ' || p_event_type || '(s). Ligue agora!',
                        'Flame',
                        jsonb_build_object('prospect_id', p_prospect_cadence_id, 'event_type', p_event_type)
                    );
                END IF;
            END IF;

            -- Exit loop after first successful transition
            EXIT;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'transitioned', v_transitioned,
        'new_stage', CASE WHEN v_transitioned THEN v_rule.to_stage ELSE v_prospect.funnel_stage END,
        'event_count', v_event_count
    );
END;
$$;
