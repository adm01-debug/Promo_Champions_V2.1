-- Table for detailed lead qualification (MQL)
CREATE TABLE IF NOT EXISTS public.mql_qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    qualified_by UUID REFERENCES public.salespeople(id), -- Referencing salespeople instead of profiles
    
    -- Qualification Fields
    budget_range TEXT,
    authority_level TEXT,
    need_urgency TEXT,
    timeline TEXT,
    
    -- Detailed Analysis
    pain_points TEXT[],
    competitors TEXT[],
    decision_process TEXT,
    
    -- Outcomes
    qualification_status TEXT DEFAULT 'pending', -- pending, qualified, unqualified, nurture
    unqualified_reason TEXT,
    nurture_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mql_qualifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Salespeople can manage qualifications"
    ON public.mql_qualifications
    FOR ALL
    USING (true);

-- Trigger for updating updated_at (using common name found in memory/history)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_mql_qualifications_updated_at
BEFORE UPDATE ON public.mql_qualifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
