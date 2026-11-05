CREATE OR REPLACE FUNCTION public.record_price_history()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.unit_price IS DISTINCT FROM NEW.unit_price THEN
    INSERT INTO price_history (supplier_product_id, product_id, supplier_id, old_price, new_price)
    VALUES (NEW.id, NEW.product_id, NEW.supplier_id, OLD.unit_price, NEW.unit_price);
    
    -- Create alert if price change is significant (> 5%)
    IF OLD.unit_price > 0 AND ABS((NEW.unit_price - OLD.unit_price) / OLD.unit_price) > 0.05 THEN
      INSERT INTO price_alerts (product_id, supplier_id, alert_type, old_price, new_price, price_change_percent)
      VALUES (
        NEW.product_id, 
        NEW.supplier_id, 
        CASE WHEN NEW.unit_price < OLD.unit_price THEN 'price_drop' ELSE 'price_increase' END,
        OLD.unit_price,
        NEW.unit_price,
        ((NEW.unit_price - OLD.unit_price) / OLD.unit_price) * 100
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
