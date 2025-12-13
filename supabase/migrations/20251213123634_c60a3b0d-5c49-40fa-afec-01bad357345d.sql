-- Add source field to sales table for lead source tracking
ALTER TABLE public.sales ADD COLUMN source TEXT DEFAULT 'other';

-- Create index for better query performance on source analysis
CREATE INDEX idx_sales_source ON public.sales(source);

-- Add comment explaining the field
COMMENT ON COLUMN public.sales.source IS 'Lead source: linkedin, referral, inbound, outbound, event, website, paid_ads, other';