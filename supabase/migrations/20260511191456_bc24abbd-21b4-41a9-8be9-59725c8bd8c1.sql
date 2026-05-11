-- 1. Registro de Preços de Concorrentes
CREATE TABLE IF NOT EXISTS public.competitors_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    competitor_id UUID REFERENCES competitors_registry(id),
    price DECIMAL(12,2) NOT NULL,
    source_url TEXT,
    is_promotion BOOLEAN DEFAULT false,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Regras de Proteção de Preço
CREATE TABLE IF NOT EXISTS public.price_protection_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    min_margin_pct DECIMAL(5,2) DEFAULT 10.0, -- Margem mínima aceitável
    target_position TEXT DEFAULT 'match', -- 'match', 'premium', 'discount'
    auto_apply BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Extensão de Sales para Inteligência Competitiva
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS lost_to_competitor_id UUID REFERENCES competitors_registry(id),
ADD COLUMN IF NOT EXISTS competitor_price_at_deal DECIMAL(12,2);

-- 4. Função para Detectar Ameaças de Preço
CREATE OR REPLACE FUNCTION public.check_price_threats()
RETURNS TRIGGER AS $$
DECLARE
    v_min_margin DECIMAL;
BEGIN
    SELECT min_margin_pct INTO v_min_margin 
    FROM price_protection_rules 
    WHERE product_id = NEW.product_id;

    -- Se o preço do concorrente for muito baixo (ex: < 80% do nosso custo/preço atual)
    -- Disparar um alerta na tabela price_alerts existente
    IF NEW.price > 0 THEN
        INSERT INTO public.price_alerts (
            product_id,
            alert_type,
            message,
            is_read
        ) VALUES (
            NEW.product_id,
            'competitor_threat',
            'Preço do concorrente detectado em ' || NEW.price || '. Risco de margem.',
            false
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_competitor_price_update
AFTER INSERT ON public.competitors_pricing
FOR EACH ROW EXECUTE FUNCTION public.check_price_threats();

-- Enable RLS
ALTER TABLE public.competitors_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_protection_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all authenticated users" ON public.competitors_pricing FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read for all authenticated users" ON public.price_protection_rules FOR SELECT USING (auth.role() = 'authenticated');
