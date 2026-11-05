-- Add SDR reference to sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS sdr_id UUID REFERENCES public.salespeople(id);

-- Enhance commissions table for dual tracking
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS sdr_commission_amount NUMERIC DEFAULT 0;
ALTER TABLE public.commissions ADD COLUMN IF NOT EXISTS is_first_sale BOOLEAN DEFAULT false;

-- Function to determine if a sale is the first for a client
CREATE OR REPLACE FUNCTION public.check_is_first_sale(p_client_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    sale_count INTEGER;
BEGIN
    SELECT count(*) INTO sale_count FROM public.sales WHERE client_id = p_client_id AND status = 'completed';
    RETURN sale_count = 0; -- If 0, the current sale being processed (before completion) is the first
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to handle commission logic on sale completion
CREATE OR REPLACE FUNCTION public.handle_sale_commissions()
RETURNS TRIGGER AS $$
DECLARE
    v_is_first_sale BOOLEAN;
    v_sdr_commission NUMERIC := 0;
    v_closer_commission NUMERIC := 0;
    v_rule_percentage NUMERIC;
BEGIN
    -- Only process completed sales
    IF (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed') OR (TG_OP = 'INSERT' AND NEW.status = 'completed') THEN
        
        -- Check if it's the first sale for this client
        v_is_first_sale := public.check_is_first_sale(NEW.client_id);
        
        -- Get commission percentage (defaulting to 5% if no rule found)
        SELECT percentage INTO v_rule_percentage 
        FROM public.commission_rules 
        WHERE is_active = true 
        AND (salesperson_id = NEW.salesperson_id OR salesperson_id IS NULL)
        ORDER BY priority DESC LIMIT 1;
        
        IF v_rule_percentage IS NULL THEN v_rule_percentage := 5.0; END IF;

        -- Closer always gets commission
        v_closer_commission := (NEW.amount * v_rule_percentage / 100);

        -- SDR only gets commission on the first sale
        IF v_is_first_sale AND NEW.sdr_id IS NOT NULL THEN
            -- SDR gets same percentage for the first activation
            v_sdr_commission := (NEW.amount * v_rule_percentage / 100);
            
            -- Insert commission record for SDR if different from Closer
            IF NEW.sdr_id != NEW.salesperson_id THEN
                INSERT INTO public.commissions (
                    sale_id, salesperson_id, base_amount, percentage, commission_amount, status, is_first_sale
                ) VALUES (
                    NEW.id, NEW.sdr_id, NEW.amount, v_rule_percentage, v_sdr_commission, 'pending', true
                );
            END IF;
        END IF;

        -- Insert/Update commission record for Closer
        -- If it's first sale and same person, we could combine, but logic says SDR brings, Closer closes.
        INSERT INTO public.commissions (
            sale_id, salesperson_id, base_amount, percentage, commission_amount, status, is_first_sale
        ) VALUES (
            NEW.id, NEW.salesperson_id, NEW.amount, v_rule_percentage, v_closer_commission, 'pending', v_is_first_sale
        );

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS tr_handle_sale_commissions ON public.sales;
CREATE TRIGGER tr_handle_sale_commissions
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_sale_commissions();
