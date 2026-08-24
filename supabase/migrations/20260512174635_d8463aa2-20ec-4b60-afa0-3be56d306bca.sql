-- Create territories table
CREATE TABLE IF NOT EXISTS public.territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    current_owner_id UUID REFERENCES public.salespeople(id),
    total_revenue NUMERIC DEFAULT 0,
    total_deals INTEGER DEFAULT 0,
    conquered_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view territories" ON public.territories FOR SELECT TO authenticated USING (true);

-- Function to sync territory ownership
CREATE OR REPLACE FUNCTION public.sync_territory_ownership()
RETURNS trigger AS $$
DECLARE
    v_territory_name TEXT;
    v_current_owner UUID;
    v_new_owner UUID;
    v_total_rev NUMERIC;
    v_total_deals INTEGER;
BEGIN
    -- Territory name is the product name or category
    v_territory_name := COALESCE(NEW.product_name, NEW.category, 'Outros');

    -- Upsert territory record
    INSERT INTO public.territories (name)
    VALUES (v_territory_name)
    ON CONFLICT (name) DO NOTHING;

    -- Calculate metrics for this territory
    SELECT salesperson_id, SUM(amount), COUNT(*) 
    INTO v_new_owner, v_total_rev, v_total_deals
    FROM public.sales
    WHERE (product_name = v_territory_name OR (product_name IS NULL AND category = v_territory_name))
    AND deal_status = 'completed'
    GROUP BY salesperson_id
    ORDER BY SUM(amount) DESC
    LIMIT 1;

    -- Get current owner
    SELECT current_owner_id INTO v_current_owner
    FROM public.territories
    WHERE name = v_territory_name;

    -- If owner changed, record in history
    IF v_new_owner IS DISTINCT FROM v_current_owner THEN
        -- Mark old conquest as lost
        IF v_current_owner IS NOT NULL THEN
            UPDATE public.territory_history 
            SET lost_at = NOW() 
            WHERE salesperson_id = v_current_owner AND lost_at IS NULL;
        END IF;

        -- Record new conquest
        INSERT INTO public.territory_history (salesperson_id, revenue_contribution, deals_count, conquered_at)
        VALUES (v_new_owner, v_total_rev, v_total_deals, NOW());

        -- Update main record
        UPDATE public.territories
        SET current_owner_id = v_new_owner,
            total_revenue = v_total_rev,
            total_deals = v_total_deals,
            conquered_at = NOW(),
            updated_at = NOW()
        WHERE name = v_territory_name;

        -- Notify Victory Feed
        INSERT INTO public.victory_feed (salesperson_id, title, description, type, metadata)
        VALUES (
            v_new_owner, 
            'Território Conquistado: ' || v_territory_name,
            'Dominou o segmento com R$ ' || v_total_rev::TEXT,
            'territory',
            jsonb_build_object('territory', v_territory_name, 'revenue', v_total_rev)
        );
    ELSE
        -- Just update metrics
        UPDATE public.territories
        SET total_revenue = v_total_rev,
            total_deals = v_total_deals,
            updated_at = NOW()
        WHERE name = v_territory_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for territory sync
DROP TRIGGER IF EXISTS tr_sync_territory ON public.sales;
CREATE TRIGGER tr_sync_territory
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.sync_territory_ownership();
