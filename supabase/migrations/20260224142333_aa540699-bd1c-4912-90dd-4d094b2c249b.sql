-- Drop old restrictive constraints
ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_category_check;
ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_status_check;

-- Add updated constraints with pipeline stages and integration values
ALTER TABLE public.sales ADD CONSTRAINT sales_category_check 
  CHECK (category = ANY (ARRAY['subscription', 'service', 'project', 'other', 'brindes']));

ALTER TABLE public.sales ADD CONSTRAINT sales_status_check 
  CHECK (status = ANY (ARRAY['completed', 'pending', 'cancelled', 'lead', 'qualified', 'proposal', 'negotiation', 'closed', 'prospecting', 'won', 'lost']));