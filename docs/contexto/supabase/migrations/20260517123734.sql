-- Drop existing policies if they are too permissive
DROP POLICY IF EXISTS "Salespeople can view their own sales" ON public.sales;
DROP POLICY IF EXISTS "Managers can view all sales" ON public.sales;
DROP POLICY IF EXISTS "Admins have full access to sales" ON public.sales;

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy for Admins and Managers to view everything
CREATE POLICY "Admins and Managers can view all sales"
ON public.sales
FOR SELECT
USING (public.is_admin_or_manager());

-- Policy for Salespeople to view their own sales
-- This covers SDRs, Closers, and Hybrids
CREATE POLICY "Salespeople can view their own sales"
ON public.sales
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.salespeople
    WHERE salespeople.auth_user_id = auth.uid()
    AND salespeople.id = sales.salesperson_id
  )
);

-- Note: Inserting and updating also need policies
CREATE POLICY "Salespeople can insert their own sales"
ON public.sales
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.salespeople
    WHERE salespeople.auth_user_id = auth.uid()
    AND salespeople.id = salesperson_id
  )
);

CREATE POLICY "Salespeople can update their own sales"
ON public.sales
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.salespeople
    WHERE salespeople.auth_user_id = auth.uid()
    AND salespeople.id = sales.salesperson_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.salespeople
    WHERE salespeople.auth_user_id = auth.uid()
    AND salespeople.id = salesperson_id
  )
);

-- Admins/Managers full write access
CREATE POLICY "Admins and Managers can insert sales"
ON public.sales
FOR INSERT
WITH CHECK (public.is_admin_or_manager());

CREATE POLICY "Admins and Managers can update sales"
ON public.sales
FOR UPDATE
USING (public.is_admin_or_manager());

CREATE POLICY "Admins and Managers can delete sales"
ON public.sales
FOR DELETE
USING (public.is_admin_or_manager());
