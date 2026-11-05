CREATE OR REPLACE FUNCTION public.trg_process_email_tracking_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_prospect_id UUID;
    v_intent_type TEXT;
BEGIN
    -- Map event types
    IF NEW.event_type = 'open' THEN
        v_intent_type := 'email_open';
    ELSIF NEW.event_type = 'click' THEN
        -- Check if it's a price click
        IF NEW.metadata->>'url' LIKE '%price%' OR NEW.metadata->>'url' LIKE '%preco%' THEN
            v_intent_type := 'price_click';
        ELSE
            v_intent_type := 'email_open';
        END IF;
    ELSE
        RETURN NEW;
    END IF;

    -- Find the active prospect cadence for this sale
    SELECT id INTO v_prospect_id
    FROM public.prospect_cadences
    WHERE sale_id = NEW.sale_id
      AND status = 'active'
    LIMIT 1;

    -- If found, process the intent
    IF v_prospect_id IS NOT NULL THEN
        PERFORM public.process_lead_intent_event(
            v_prospect_id,
            v_intent_type,
            jsonb_build_object(
                'source', 'email_tracking',
                'event_id', NEW.id,
                'metadata', NEW.metadata
            )
        );
    END IF;

    RETURN NEW;
END;
$function$
