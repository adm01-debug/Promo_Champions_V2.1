-- Ensure lat/lng columns exist in clients
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'lat') THEN
        ALTER TABLE public.clients ADD COLUMN lat DOUBLE PRECISION;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'lng') THEN
        ALTER TABLE public.clients ADD COLUMN lng DOUBLE PRECISION;
    END IF;
END $$;

-- Update sales table if needed (adding columns for SKU and inventory link)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'sku') THEN
        ALTER TABLE public.sales ADD COLUMN sku TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'stock_reduced') THEN
        ALTER TABLE public.sales ADD COLUMN stock_reduced BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Function to update client total_value based on completed sales
CREATE OR REPLACE FUNCTION public.update_client_total_value()
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
        WHERE id = OLD.client_id;
    ELSIF (TG_OP = 'DELETE' AND OLD.status = 'completed') THEN
        UPDATE public.clients
        SET total_value = GREATEST(0, COALESCE(total_value, 0) - OLD.amount),
            updated_at = now()
        WHERE id = OLD.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for client total_value
DROP TRIGGER IF EXISTS tr_update_client_value ON public.sales;
CREATE TRIGGER tr_update_client_value
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.update_client_total_value();

-- Function to manage stock on sale completion
CREATE OR REPLACE FUNCTION public.manage_stock_on_sale()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for stock management
DROP TRIGGER IF EXISTS tr_manage_stock ON public.sales;
CREATE TRIGGER tr_manage_stock
BEFORE INSERT OR UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.manage_stock_on_sale();
