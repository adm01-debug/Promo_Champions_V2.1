CREATE OR REPLACE FUNCTION public.handle_stock_management()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Se a venda for concluída, reduz o estoque (se ainda não reduzido)
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed')) THEN
        IF NEW.product_id IS NOT NULL THEN
            UPDATE public.products 
            SET stock_quantity = GREATEST(0, COALESCE(stock_quantity, 0) - 1),
                sales_count = COALESCE(sales_count, 0) + 1,
                updated_at = now()
            WHERE id = NEW.product_id;
        END IF;
    -- Se uma venda concluída for cancelada ou movida para outro status, devolve ao estoque
    ELSIF (OLD.status = 'completed' AND NEW.status <> 'completed') THEN
        IF OLD.product_id IS NOT NULL THEN
            UPDATE public.products 
            SET stock_quantity = COALESCE(stock_quantity, 0) + 1,
                sales_count = GREATEST(0, COALESCE(sales_count, 0) - 1),
                updated_at = now()
            WHERE id = OLD.product_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
