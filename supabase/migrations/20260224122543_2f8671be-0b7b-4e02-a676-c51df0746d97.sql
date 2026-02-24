
-- Quotes/Budget tracking table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_value NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  external_reference TEXT,
  valid_until DATE,
  sent_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_by UUID REFERENCES public.salespeople(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Closers and admins/managers can do everything
CREATE POLICY "Closers can read quotes" ON public.quotes
  FOR SELECT USING (
    is_admin_or_manager(auth.uid()) OR 
    created_by = get_current_salesperson_id()
  );

CREATE POLICY "Closers can insert quotes" ON public.quotes
  FOR INSERT WITH CHECK (
    is_admin_or_manager(auth.uid()) OR 
    created_by = get_current_salesperson_id()
  );

CREATE POLICY "Closers can update quotes" ON public.quotes
  FOR UPDATE USING (
    is_admin_or_manager(auth.uid()) OR 
    created_by = get_current_salesperson_id()
  );

CREATE POLICY "Admins can delete quotes" ON public.quotes
  FOR DELETE USING (
    is_admin_or_manager(auth.uid())
  );

-- Trigger for updated_at
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
