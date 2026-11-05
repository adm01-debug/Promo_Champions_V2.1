-- Itens do Orçamento (Multi-item support)
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(15,2) NOT NULL,
    discount_amount NUMERIC(15,2) DEFAULT 0,
    total_price NUMERIC(15,2) NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    billing_period TEXT, -- monthly, quarterly, annual
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Suporte a Assinaturas e Faturamento em Quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'BRL';
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(15,6) DEFAULT 1.0;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'pending'; -- pending, partial, billed
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS contract_start_date DATE;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS contract_end_date DATE;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS subscription_type TEXT; -- saas, service, one-time

-- Regras de Preço (Pricing Rules Engine)
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rule_type TEXT NOT NULL, -- volume_discount, bundle_discount, tier_pricing
    product_id UUID REFERENCES public.products(id),
    min_quantity INTEGER,
    discount_percentage NUMERIC(5,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Relacionamento de Aprovação (Approval Matrix Level)
ALTER TABLE public.approval_workflows ADD COLUMN IF NOT EXISTS min_mrr_threshold NUMERIC(15,2);
ALTER TABLE public.approval_workflows ADD COLUMN IF NOT EXISTS auto_approve_below_discount NUMERIC(5,2);

-- Enable RLS
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Quote items are viewable by authenticated users" ON public.quote_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Pricing rules are viewable by authenticated users" ON public.pricing_rules FOR SELECT USING (auth.role() = 'authenticated');
