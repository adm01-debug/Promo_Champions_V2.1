-- 1. Clients Table Enhancements
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS total_value DECIMAL(12,2) DEFAULT 0;

-- 2. Products Table Enhancements
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Assinatura';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- 3. Sales Table Enhancements
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS salesperson_id UUID;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS sku TEXT;

-- 4. Client Interactions Table
CREATE TABLE IF NOT EXISTS public.client_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- call, email, meeting, etc.
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID
);

ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view interactions of clients they can see" 
ON public.client_interactions FOR SELECT USING (true);

CREATE POLICY "Users can insert interactions" 
ON public.client_interactions FOR INSERT WITH CHECK (true);

-- 5. Trigger for Client Total Value (LTV)
CREATE OR REPLACE FUNCTION public.update_client_total_value()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'completed') OR (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') THEN
        UPDATE public.clients 
        SET total_value = COALESCE(total_value, 0) + NEW.amount
        WHERE id = NEW.client_id;
    ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'completed' AND NEW.status != 'completed') THEN
        UPDATE public.clients 
        SET total_value = GREATEST(0, COALESCE(total_value, 0) - OLD.amount)
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_client_total_value ON public.sales;
CREATE TRIGGER tr_update_client_total_value
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_client_total_value();

-- 6. Trigger for Product Stock Management
CREATE OR REPLACE FUNCTION public.update_product_stock()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_product_stock ON public.sales;
CREATE TRIGGER tr_update_product_stock
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_product_stock();
