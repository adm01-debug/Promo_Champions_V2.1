-- Correct trigger for LTV to use NEW.amount
CREATE OR REPLACE FUNCTION public.update_client_ltv_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR 
       (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed')) THEN
        UPDATE public.clients
        SET total_value = COALESCE(total_value, 0) + NEW.amount,
            updated_at = now()
        WHERE id = NEW.client_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
        UPDATE public.clients
        SET total_value = GREATEST(0, COALESCE(total_value, 0) - OLD.amount),
            updated_at = now()
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-add new clients to Kanban (Portfolio)
CREATE OR REPLACE FUNCTION public.auto_add_client_to_portfolio()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.client_portfolio (client_id, status)
    VALUES (NEW.id, 'active')
    ON CONFLICT (client_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_auto_add_client_portfolio ON public.clients;
CREATE TRIGGER tr_auto_add_client_portfolio
AFTER INSERT ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.auto_add_client_to_portfolio();

-- Trigger to deduct stock on completed sale
CREATE OR REPLACE FUNCTION public.handle_stock_on_sale()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_handle_stock_on_sale ON public.sales;
CREATE TRIGGER tr_handle_stock_on_sale
AFTER UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_stock_on_sale();
