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
$function$
