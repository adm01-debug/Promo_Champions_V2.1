-- Add funnel_stage to prospect_cadences
ALTER TABLE public.prospect_cadences 
ADD COLUMN IF NOT EXISTS funnel_stage TEXT DEFAULT 'new' CHECK (funnel_stage IN ('new', 'high_interest', 'waiting_approval', 'scheduled'));

-- Create cadence_funnel_rules table
CREATE TABLE IF NOT EXISTS public.cadence_funnel_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cadence_id UUID REFERENCES public.cadences(id) ON DELETE CASCADE,
    from_stage TEXT NOT NULL CHECK (from_stage IN ('new', 'high_interest', 'waiting_approval', 'scheduled')),
    to_stage TEXT NOT NULL CHECK (to_stage IN ('new', 'high_interest', 'waiting_approval', 'scheduled')),
    condition_type TEXT NOT NULL CHECK (condition_type IN ('email_open', 'quote_open', 'price_click', 'reply', 'manual')),
    condition_value INTEGER DEFAULT 1, -- Threshold (e.g., 3 email opens)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cadence_funnel_rules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view funnel rules" 
ON public.cadence_funnel_rules FOR SELECT USING (true);

CREATE POLICY "Users can manage funnel rules" 
ON public.cadence_funnel_rules FOR ALL USING (true);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_cadence_funnel_rules_updated_at
BEFORE UPDATE ON public.cadence_funnel_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
