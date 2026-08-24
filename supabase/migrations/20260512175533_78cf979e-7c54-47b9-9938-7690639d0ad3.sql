-- Create territories table if not exists
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
DROP POLICY IF EXISTS "Territories are viewable by everyone" ON public.territories;
CREATE POLICY "Territories are viewable by everyone" ON public.territories FOR SELECT USING (true);

-- Function to update territory conquests
CREATE OR REPLACE FUNCTION public.update_territory_conquests()
RETURNS VOID AS $$
DECLARE
    territory_rec RECORD;
    top_owner_id UUID;
    top_revenue NUMERIC;
    total_deals_val INTEGER;
    total_revenue_val NUMERIC;
BEGIN
    -- For each distinct territory name
    FOR territory_rec IN 
        SELECT DISTINCT COALESCE(product_name, category, 'Outros') as t_name FROM public.sales WHERE status IN ('won', 'completed')
    LOOP
        -- Find the top owner
        SELECT salesperson_id, SUM(amount) INTO top_owner_id, top_revenue
        FROM public.sales
        WHERE COALESCE(product_name, category, 'Outros') = territory_rec.t_name
          AND status IN ('won', 'completed')
        GROUP BY salesperson_id
        ORDER BY 2 DESC
        LIMIT 1;

        -- Get totals for the territory
        SELECT SUM(amount), COUNT(*) INTO total_revenue_val, total_deals_val
        FROM public.sales
        WHERE COALESCE(product_name, category, 'Outros') = territory_rec.t_name
          AND status IN ('won', 'completed');

        -- Upsert
        INSERT INTO public.territories (name, current_owner_id, total_revenue, total_deals, conquered_at)
        VALUES (territory_rec.t_name, top_owner_id, total_revenue_val, total_deals_val, now())
        ON CONFLICT (name) DO UPDATE 
        SET current_owner_id = EXCLUDED.current_owner_id,
            total_revenue = EXCLUDED.total_revenue,
            total_deals = EXCLUDED.total_deals,
            conquered_at = CASE WHEN territories.current_owner_id IS NULL OR territories.current_owner_id <> EXCLUDED.current_owner_id THEN now() ELSE territories.conquered_at END,
            updated_at = now();
            
        -- Log to history if owner changed
        -- Assuming territory_history table exists from previous audit check
        IF EXISTS (SELECT 1 FROM public.territories t WHERE t.name = territory_rec.t_name AND (t.current_owner_id IS NULL OR t.current_owner_id <> top_owner_id)) THEN
             INSERT INTO public.territory_history (territory_id, salesperson_id, revenue_contribution, deals_count, conquered_at)
             SELECT id, top_owner_id, top_revenue, total_deals_val, now()
             FROM public.territories WHERE name = territory_rec.t_name;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE OR REPLACE FUNCTION public.trigger_update_territories()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.update_territory_conquests();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_territories_on_sale ON public.sales;
CREATE TRIGGER update_territories_on_sale
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_territories();
