-- Drop permissive policies for salesperson_commission_configs
DROP POLICY IF EXISTS "Gerenciar comissões" ON public.salesperson_commission_configs;

-- Create secure policies for salesperson_commission_configs
CREATE POLICY "Admins can manage commission configs"
ON public.salesperson_commission_configs
FOR ALL
TO authenticated
USING (is_admin_or_manager(auth.uid()))
WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "Salespeople can view their own commission config"
ON public.salesperson_commission_configs
FOR SELECT
TO authenticated
USING (get_current_salesperson_id() = salesperson_id);
