CREATE OR REPLACE FUNCTION public.update_product_stock()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
        UPDATE public.products 
        SET stock_quantity = GREATEST(0, stock_quantity - 1)
        WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
        UPDATE public.products 
        SET stock_quantity = stock_quantity + 1
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$function$
