-- Add column to track first-time sale for a client
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS is_first_sale BOOLEAN DEFAULT false;

-- Index to quickly find previous sales for a client
CREATE INDEX IF NOT EXISTS idx_sales_client_name_status ON public.sales(client_name, status);

-- Update existing sales: if it's the only completed sale for that client name, mark as first sale
-- (Simple heuristic for existing data)
WITH first_sales AS (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER(PARTITION BY client_name ORDER BY created_at ASC) as rank
    FROM public.sales
    WHERE status = 'completed'
  ) t WHERE rank = 1
)
UPDATE public.sales
SET is_first_sale = true
WHERE id IN (SELECT id FROM first_sales);

COMMENT ON COLUMN public.sales.is_first_sale IS 'Indicates if this was the first successful sale for this client name, used for SDR/Closer commission splitting.';