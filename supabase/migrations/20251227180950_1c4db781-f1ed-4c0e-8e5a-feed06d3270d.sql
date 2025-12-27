-- Create price_history table for tracking price changes
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_product_id UUID REFERENCES public.supplier_products(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  price_change_percent NUMERIC GENERATED ALWAYS AS (
    CASE WHEN old_price > 0 THEN ((new_price - old_price) / old_price) * 100 ELSE 0 END
  ) STORED,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_alerts table for significant price changes
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_drop', 'price_increase', 'new_best_price')),
  old_price NUMERIC,
  new_price NUMERIC NOT NULL,
  price_change_percent NUMERIC,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_history
CREATE POLICY "Authenticated users can read price_history" 
ON public.price_history 
FOR SELECT 
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert price_history" 
ON public.price_history 
FOR INSERT 
WITH CHECK (is_authenticated());

-- RLS Policies for price_alerts
CREATE POLICY "Authenticated users can read price_alerts" 
ON public.price_alerts 
FOR SELECT 
USING (is_authenticated());

CREATE POLICY "Authenticated users can insert price_alerts" 
ON public.price_alerts 
FOR INSERT 
WITH CHECK (is_authenticated());

CREATE POLICY "Authenticated users can update price_alerts" 
ON public.price_alerts 
FOR UPDATE 
USING (is_authenticated());

-- Indexes
CREATE INDEX idx_price_history_supplier_product ON public.price_history(supplier_product_id);
CREATE INDEX idx_price_history_product ON public.price_history(product_id);
CREATE INDEX idx_price_history_recorded_at ON public.price_history(recorded_at);
CREATE INDEX idx_price_alerts_product ON public.price_alerts(product_id);
CREATE INDEX idx_price_alerts_unread ON public.price_alerts(is_read) WHERE is_read = false;

-- Function to record price history when supplier_products price changes
CREATE OR REPLACE FUNCTION public.record_price_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Trigger to record price history
CREATE TRIGGER trigger_record_price_history
AFTER UPDATE ON public.supplier_products
FOR EACH ROW
EXECUTE FUNCTION public.record_price_history();