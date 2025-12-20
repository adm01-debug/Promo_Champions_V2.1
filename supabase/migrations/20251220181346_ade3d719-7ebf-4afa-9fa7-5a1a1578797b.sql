-- Create demand_forecasts table for product demand predictions
CREATE TABLE public.demand_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  predicted_quantity INTEGER NOT NULL DEFAULT 0,
  predicted_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  confidence_score NUMERIC(5,2) DEFAULT 0.80,
  factors JSONB DEFAULT '{}',
  model_version TEXT DEFAULT 'v1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_levels table for stock management
CREATE TABLE public.inventory_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 10,
  max_stock_level INTEGER NOT NULL DEFAULT 100,
  reorder_point INTEGER NOT NULL DEFAULT 20,
  lead_time_days INTEGER DEFAULT 7,
  last_restock_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stock_movements table for tracking inventory changes
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Policies for demand_forecasts (authenticated users can view, admins/managers can modify)
CREATE POLICY "Authenticated users can view demand forecasts" 
  ON public.demand_forecasts FOR SELECT 
  USING (public.is_authenticated());

CREATE POLICY "Admins and managers can insert demand forecasts" 
  ON public.demand_forecasts FOR INSERT 
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update demand forecasts" 
  ON public.demand_forecasts FOR UPDATE 
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete demand forecasts" 
  ON public.demand_forecasts FOR DELETE 
  USING (public.is_admin_or_manager(auth.uid()));

-- Policies for inventory_levels
CREATE POLICY "Authenticated users can view inventory levels" 
  ON public.inventory_levels FOR SELECT 
  USING (public.is_authenticated());

CREATE POLICY "Admins and managers can insert inventory levels" 
  ON public.inventory_levels FOR INSERT 
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update inventory levels" 
  ON public.inventory_levels FOR UPDATE 
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete inventory levels" 
  ON public.inventory_levels FOR DELETE 
  USING (public.is_admin_or_manager(auth.uid()));

-- Policies for stock_movements
CREATE POLICY "Authenticated users can view stock movements" 
  ON public.stock_movements FOR SELECT 
  USING (public.is_authenticated());

CREATE POLICY "Admins and managers can insert stock movements" 
  ON public.stock_movements FOR INSERT 
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_demand_forecasts_product_id ON public.demand_forecasts(product_id);
CREATE INDEX idx_demand_forecasts_date ON public.demand_forecasts(forecast_date);
CREATE INDEX idx_inventory_levels_product_id ON public.inventory_levels(product_id);
CREATE INDEX idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);

-- Triggers for updated_at
CREATE TRIGGER update_demand_forecasts_updated_at
  BEFORE UPDATE ON public.demand_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_levels_updated_at
  BEFORE UPDATE ON public.inventory_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();