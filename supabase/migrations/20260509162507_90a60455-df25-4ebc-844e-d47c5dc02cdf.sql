-- Refinar o gatilho de LTV para ser mais robusto
CREATE OR REPLACE FUNCTION public.handle_client_ltv_update()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR 
       (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status <> 'completed') THEN
        UPDATE public.clients 
        SET total_value = COALESCE(total_value, 0) + NEW.amount,
            updated_at = now()
        WHERE id = NEW.client_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status <> 'completed') OR
          (TG_OP = 'DELETE' AND OLD.status = 'completed') THEN
        UPDATE public.clients 
        SET total_value = GREATEST(0, COALESCE(total_value, 0) - OLD.amount),
            updated_at = now()
        WHERE id = OLD.client_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Garantir que o gatilho de LTV use a nova função
DROP TRIGGER IF EXISTS tr_update_client_total_value ON public.sales;
CREATE TRIGGER tr_update_client_total_value
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.handle_client_ltv_update();

-- Refinar o gatilho de estoque para tratar retornos
CREATE OR REPLACE FUNCTION public.handle_stock_management()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SET search_path = public;

-- Atualizar o gatilho de estoque
DROP TRIGGER IF EXISTS tr_handle_stock_on_sale ON public.sales;
CREATE TRIGGER tr_handle_stock_on_sale
AFTER UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.handle_stock_management();

-- Automação: Criar follow-up automático ao concluir uma venda
CREATE OR REPLACE FUNCTION public.auto_create_sale_followup()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed')) THEN
        INSERT INTO public.agenda_events (
            title, 
            description, 
            event_type, 
            status, 
            priority, 
            scheduled_at, 
            client_id, 
            sale_id, 
            salesperson_id
        ) VALUES (
            'Follow-up Pós-Venda: ' || NEW.product_name,
            'Verificar satisfação do cliente com a compra de ' || NEW.product_name,
            'follow_up',
            'pending',
            'medium',
            now() + interval '7 days',
            NEW.client_id,
            NEW.id,
            NEW.salesperson_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS tr_auto_followup_on_sale ON public.sales;
CREATE TRIGGER tr_auto_followup_on_sale
AFTER UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.auto_create_sale_followup();
