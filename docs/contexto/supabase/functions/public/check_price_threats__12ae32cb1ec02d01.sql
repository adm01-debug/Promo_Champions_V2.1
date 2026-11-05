CREATE OR REPLACE FUNCTION public.check_price_threats()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_min_margin DECIMAL;
BEGIN
    SELECT min_margin_pct INTO v_min_margin 
    FROM public.price_protection_rules 
    WHERE product_id = NEW.product_id;

    -- Se o preço do concorrente for muito baixo
    IF NEW.price > 0 THEN
        INSERT INTO public.price_alerts (
            product_id,
            alert_type,
            message,
            is_read
        ) VALUES (
            NEW.product_id,
            'competitor_threat',
            'Preço do concorrente detectado em ' || NEW.price || '. Risco de margem.',
            false
        );
    END IF;

    RETURN NEW;
END;
$function$
