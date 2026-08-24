-- Add client_id and product_id to sales
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE SET NULL;

-- Add client_id to tasks
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;

-- Create function to update client total value
CREATE OR REPLACE FUNCTION public.update_client_total_value()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' OR (OLD.status = 'completed' AND NEW.status != 'completed') THEN
    UPDATE public.clients
    SET total_value = (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.sales
      WHERE client_id = COALESCE(NEW.client_id, OLD.client_id)
      AND status = 'completed'
    )
    WHERE id = COALESCE(NEW.client_id, OLD.client_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for sales updates
DROP TRIGGER IF EXISTS tr_update_client_total_value ON public.sales;
CREATE TRIGGER tr_update_client_total_value
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_client_total_value();

-- Add index for better performance on joins
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON public.sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales(product_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
