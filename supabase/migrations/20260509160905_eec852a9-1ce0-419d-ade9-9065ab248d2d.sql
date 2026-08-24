-- Ensure lat/lng columns exist on clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS total_value DECIMAL(12,2) DEFAULT 0;

-- Ensure stock columns exist on products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 5;

-- Enhance activities to link directly to clients (not just deals)
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);

-- Create trigger function to update client's total_value (LTV) when a sale is completed
CREATE OR REPLACE FUNCTION public.update_client_ltv_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Update client total_value if sale is 'completed'
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

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS tr_update_client_ltv ON public.sales;
CREATE TRIGGER tr_update_client_ltv
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_client_ltv_on_sale();
