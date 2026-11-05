-- Add activation columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_is_activated ON public.clients(is_activated);

-- Function to handle activation on sale update/insert
CREATE OR REPLACE FUNCTION public.handle_client_activation()
RETURNS TRIGGER AS $$
BEGIN
    -- If the sale is completed and it's the first sale
    IF (NEW.status = 'completed' AND NEW.is_first_sale = true) THEN
        UPDATE public.clients
        SET 
            is_activated = true,
            activated_at = COALESCE(activated_at, now()),
            updated_at = now()
        WHERE id = NEW.client_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for sales table
DROP TRIGGER IF EXISTS tr_on_sale_activation ON public.sales;
CREATE TRIGGER tr_on_sale_activation
AFTER INSERT OR UPDATE OF status, is_first_sale ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_client_activation();

-- One-time sync: Activate clients who already have completed first sales
UPDATE public.clients c
SET 
    is_activated = true,
    activated_at = s.created_at
FROM public.sales s
WHERE s.client_id = c.id 
  AND s.status = 'completed' 
  AND s.is_first_sale = true
  AND c.is_activated = false;
