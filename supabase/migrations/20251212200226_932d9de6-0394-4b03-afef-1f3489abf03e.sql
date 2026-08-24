-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'cancelled')),
  category TEXT NOT NULL DEFAULT 'subscription' CHECK (category IN ('subscription', 'service', 'project', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_metrics table for storing aggregated metrics
CREATE TABLE public.daily_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  revenue_goal DECIMAL(12,2) NOT NULL DEFAULT 0,
  new_clients INTEGER NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  avg_ticket DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create category_metrics table
CREATE TABLE public.category_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, category)
);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access (dashboard data)
CREATE POLICY "Allow public read access to sales" ON public.sales
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to daily_metrics" ON public.daily_metrics
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to category_metrics" ON public.category_metrics
  FOR SELECT USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for sales
INSERT INTO public.sales (client_name, product_name, amount, status, category, created_at) VALUES
  ('João Silva', 'Plano Premium', 1299, 'completed', 'subscription', now() - interval '1 day'),
  ('Maria Santos', 'Plano Básico', 499, 'pending', 'subscription', now() - interval '2 days'),
  ('Carlos Oliveira', 'Plano Enterprise', 2999, 'completed', 'subscription', now() - interval '3 days'),
  ('Ana Costa', 'Consultoria', 2500, 'completed', 'service', now() - interval '4 days'),
  ('Pedro Lima', 'Implementação', 15000, 'completed', 'project', now() - interval '5 days'),
  ('Lucia Ferreira', 'Plano Premium', 1299, 'completed', 'subscription', now() - interval '6 days'),
  ('Roberto Mendes', 'Treinamento', 5000, 'pending', 'service', now() - interval '7 days'),
  ('Fernanda Alves', 'Plano Básico', 499, 'completed', 'subscription', now() - interval '8 days'),
  ('Marcos Souza', 'Plano Enterprise', 2999, 'cancelled', 'subscription', now() - interval '10 days'),
  ('Julia Lima', 'Consultoria', 2500, 'completed', 'service', now() - interval '15 days'),
  ('Rafael Costa', 'Plano Premium', 1299, 'completed', 'subscription', now() - interval '20 days'),
  ('Camila Santos', 'Implementação', 15000, 'completed', 'project', now() - interval '25 days'),
  ('Bruno Oliveira', 'Plano Básico', 499, 'completed', 'subscription', now() - interval '30 days'),
  ('Patricia Ferreira', 'Treinamento', 5000, 'completed', 'service', now() - interval '45 days'),
  ('Diego Almeida', 'Plano Enterprise', 2999, 'completed', 'subscription', now() - interval '60 days');

-- Insert sample daily metrics
INSERT INTO public.daily_metrics (date, revenue, revenue_goal, new_clients, total_sales, conversion_rate, avg_ticket) VALUES
  (CURRENT_DATE - interval '90 days', 45000, 50000, 12, 28, 10.5, 1607),
  (CURRENT_DATE - interval '60 days', 52000, 55000, 15, 35, 11.2, 1486),
  (CURRENT_DATE - interval '45 days', 61000, 60000, 18, 42, 12.8, 1452),
  (CURRENT_DATE - interval '30 days', 58000, 65000, 14, 38, 11.5, 1526),
  (CURRENT_DATE - interval '15 days', 72000, 70000, 22, 48, 13.2, 1500),
  (CURRENT_DATE - interval '7 days', 65000, 70000, 16, 42, 12.1, 1548),
  (CURRENT_DATE, 85000, 80000, 25, 52, 14.5, 1635);

-- Insert category metrics
INSERT INTO public.category_metrics (date, category, percentage) VALUES
  (CURRENT_DATE, 'subscription', 45),
  (CURRENT_DATE, 'service', 30),
  (CURRENT_DATE, 'project', 15),
  (CURRENT_DATE, 'other', 10),
  (CURRENT_DATE - interval '30 days', 'subscription', 42),
  (CURRENT_DATE - interval '30 days', 'service', 32),
  (CURRENT_DATE - interval '30 days', 'project', 16),
  (CURRENT_DATE - interval '30 days', 'other', 10);