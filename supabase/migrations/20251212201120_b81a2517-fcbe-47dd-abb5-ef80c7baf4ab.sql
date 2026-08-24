-- Create salespeople table
CREATE TABLE public.salespeople (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales goals table
CREATE TABLE public.sales_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  goal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id, month)
);

-- Add salesperson reference to sales table
ALTER TABLE public.sales 
ADD COLUMN salesperson_id UUID REFERENCES public.salespeople(id);

-- Enable RLS
ALTER TABLE public.salespeople ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to salespeople" ON public.salespeople
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to sales_goals" ON public.sales_goals
  FOR SELECT USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_salespeople_updated_at
  BEFORE UPDATE ON public.salespeople
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample salespeople
INSERT INTO public.salespeople (name, email, commission_rate) VALUES
  ('João Silva', 'joao@salespro.com', 12.00),
  ('Maria Santos', 'maria@salespro.com', 10.00),
  ('Carlos Oliveira', 'carlos@salespro.com', 11.00),
  ('Ana Costa', 'ana@salespro.com', 10.50),
  ('Pedro Lima', 'pedro@salespro.com', 9.50);

-- Insert sample goals for current month
INSERT INTO public.sales_goals (salesperson_id, month, goal_amount)
SELECT id, date_trunc('month', CURRENT_DATE)::date, 
  CASE 
    WHEN name = 'João Silva' THEN 150000
    WHEN name = 'Maria Santos' THEN 120000
    WHEN name = 'Carlos Oliveira' THEN 130000
    WHEN name = 'Ana Costa' THEN 100000
    ELSE 80000
  END
FROM public.salespeople;

-- Update existing sales with random salesperson assignment
UPDATE public.sales 
SET salesperson_id = (
  SELECT id FROM public.salespeople ORDER BY random() LIMIT 1
)
WHERE salesperson_id IS NULL;