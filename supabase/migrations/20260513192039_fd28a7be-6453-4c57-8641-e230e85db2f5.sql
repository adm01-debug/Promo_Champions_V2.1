-- Update auto_add_client_to_portfolio
CREATE OR REPLACE FUNCTION public.auto_add_client_to_portfolio()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.client_portfolio (client_id, status)
    VALUES (NEW.id, 'active')
    ON CONFLICT (client_id) DO NOTHING;
    RETURN NEW;
END;
$function$;

-- Update handle_stock_on_sale
CREATE OR REPLACE FUNCTION public.handle_stock_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed')) THEN
        IF NEW.product_id IS NOT NULL THEN
            UPDATE public.inventory_levels
            SET current_stock = GREATEST(0, current_stock - 1),
                updated_at = now()
            WHERE product_id = NEW.product_id;
            
            INSERT INTO public.stock_movements (product_id, movement_type, quantity, reason, reference_id)
            VALUES (NEW.product_id, 'exit', 1, 'Venda Concluída: ' || NEW.id, NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

-- Update calculate_lead_distribution
CREATE OR REPLACE FUNCTION public.calculate_lead_distribution()
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_object_agg(range, count) INTO result
  FROM (
    SELECT 
      CASE 
        WHEN score < 20 THEN '0-20'
        WHEN score < 40 THEN '21-40'
        WHEN score < 60 THEN '41-60'
        WHEN score < 80 THEN '61-80'
        ELSE '81-100'
      END as range,
      count(*) as count
    FROM public.lead_scores
    GROUP BY range
  ) sub;
  RETURN COALESCE(result, '{}'::jsonb);
END;
$function$;

-- Update check_price_threats
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
$function$;
