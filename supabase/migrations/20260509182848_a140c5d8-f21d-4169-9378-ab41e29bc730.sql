-- Add enrichment columns to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS enrichment_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT 'pending';

-- Create RPC for lead enrichment
CREATE OR REPLACE FUNCTION public.enrich_lead_data(lead_id UUID, new_data JSONB)
RETURNS VOID AS $$
BEGIN
    UPDATE public.sales
    SET 
        enrichment_data = enrichment_data || new_data,
        enrichment_status = 'completed',
        updated_at = now()
    WHERE id = lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS for enrichment data
-- Assuming users can update their own leads
CREATE POLICY "Users can enrich their own leads" 
ON public.sales 
FOR UPDATE 
USING (auth.uid() = salesperson_id)
WITH CHECK (auth.uid() = salesperson_id);
