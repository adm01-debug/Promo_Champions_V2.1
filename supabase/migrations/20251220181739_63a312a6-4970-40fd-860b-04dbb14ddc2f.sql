-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  cnpj TEXT,
  category TEXT DEFAULT 'geral',
  payment_terms TEXT DEFAULT '30 dias',
  lead_time_days INTEGER DEFAULT 7,
  reliability_score NUMERIC(3,2) DEFAULT 0.85,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_products table (products offered by each supplier)
CREATE TABLE public.supplier_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  unit_price NUMERIC(12,2) NOT NULL,
  min_order_quantity INTEGER DEFAULT 1,
  currency TEXT DEFAULT 'BRL',
  last_price_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_preferred BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, product_id)
);

-- Create supplier_orders table
CREATE TABLE public.supplier_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  order_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expected_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_order_items table
CREATE TABLE public.supplier_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.supplier_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_risk_assessments table
CREATE TABLE public.supplier_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  financial_risk NUMERIC(3,2) DEFAULT 0.5,
  delivery_risk NUMERIC(3,2) DEFAULT 0.5,
  quality_risk NUMERIC(3,2) DEFAULT 0.5,
  overall_risk NUMERIC(3,2) DEFAULT 0.5,
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  factors JSONB DEFAULT '{}',
  recommendations TEXT,
  assessed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_risk_assessments ENABLE ROW LEVEL SECURITY;

-- Policies for suppliers
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers FOR SELECT USING (public.is_authenticated());
CREATE POLICY "Admins and managers can insert suppliers" ON public.suppliers FOR INSERT WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update suppliers" ON public.suppliers FOR UPDATE USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can delete suppliers" ON public.suppliers FOR DELETE USING (public.is_admin_or_manager(auth.uid()));

-- Policies for supplier_products
CREATE POLICY "Authenticated users can view supplier_products" ON public.supplier_products FOR SELECT USING (public.is_authenticated());
CREATE POLICY "Admins and managers can insert supplier_products" ON public.supplier_products FOR INSERT WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update supplier_products" ON public.supplier_products FOR UPDATE USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can delete supplier_products" ON public.supplier_products FOR DELETE USING (public.is_admin_or_manager(auth.uid()));

-- Policies for supplier_orders
CREATE POLICY "Authenticated users can view supplier_orders" ON public.supplier_orders FOR SELECT USING (public.is_authenticated());
CREATE POLICY "Admins and managers can insert supplier_orders" ON public.supplier_orders FOR INSERT WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update supplier_orders" ON public.supplier_orders FOR UPDATE USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can delete supplier_orders" ON public.supplier_orders FOR DELETE USING (public.is_admin_or_manager(auth.uid()));

-- Policies for supplier_order_items
CREATE POLICY "Authenticated users can view supplier_order_items" ON public.supplier_order_items FOR SELECT USING (public.is_authenticated());
CREATE POLICY "Admins and managers can insert supplier_order_items" ON public.supplier_order_items FOR INSERT WITH CHECK (public.is_admin_or_manager(auth.uid()));

-- Policies for supplier_risk_assessments
CREATE POLICY "Authenticated users can view supplier_risk_assessments" ON public.supplier_risk_assessments FOR SELECT USING (public.is_authenticated());
CREATE POLICY "Admins and managers can insert supplier_risk_assessments" ON public.supplier_risk_assessments FOR INSERT WITH CHECK (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Admins and managers can update supplier_risk_assessments" ON public.supplier_risk_assessments FOR UPDATE USING (public.is_admin_or_manager(auth.uid()));

-- Indexes
CREATE INDEX idx_suppliers_category ON public.suppliers(category);
CREATE INDEX idx_suppliers_is_active ON public.suppliers(is_active);
CREATE INDEX idx_supplier_products_supplier ON public.supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_product ON public.supplier_products(product_id);
CREATE INDEX idx_supplier_orders_supplier ON public.supplier_orders(supplier_id);
CREATE INDEX idx_supplier_orders_status ON public.supplier_orders(status);
CREATE INDEX idx_supplier_risk_assessments_supplier ON public.supplier_risk_assessments(supplier_id);

-- Triggers
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_products_updated_at BEFORE UPDATE ON public.supplier_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_orders_updated_at BEFORE UPDATE ON public.supplier_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();