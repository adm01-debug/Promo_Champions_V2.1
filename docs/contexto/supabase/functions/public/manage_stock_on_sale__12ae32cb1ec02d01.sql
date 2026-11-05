CREATE OR REPLACE FUNCTION public.manage_stock_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.product_id IS NOT NULL AND NEW.stock_reduced = FALSE THEN
        UPDATE public.products
        SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - 1),
            sales_count = COALESCE(sales_count, 0) + 1,
            updated_at = now()
        WHERE id = NEW.product_id;
        
        NEW.stock_reduced := TRUE;
    END IF;
    RETURN NEW;
END;
$function$
