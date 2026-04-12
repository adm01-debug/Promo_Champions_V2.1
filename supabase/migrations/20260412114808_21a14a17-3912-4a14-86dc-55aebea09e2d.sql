-- Fix supplier-related tables: restrict SELECT to admin/manager
DROP POLICY IF EXISTS "Authenticated users can view supplier_risk_assessments" ON supplier_risk_assessments;
CREATE POLICY "Admin/manager can view supplier_risk_assessments" ON supplier_risk_assessments FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read price_history" ON price_history;
CREATE POLICY "Admin/manager can view price_history" ON price_history FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can read price_alerts" ON price_alerts;
CREATE POLICY "Admin/manager can view price_alerts" ON price_alerts FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view supplier_products" ON supplier_products;
CREATE POLICY "Admin/manager can view supplier_products" ON supplier_products FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view supplier_orders" ON supplier_orders;
CREATE POLICY "Admin/manager can view supplier_orders" ON supplier_orders FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view supplier_order_items" ON supplier_order_items;
CREATE POLICY "Admin/manager can view supplier_order_items" ON supplier_order_items FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));

-- Fix salesperson_custom_field_values: scope to own records or admin/manager
DROP POLICY IF EXISTS "Authenticated can view field values" ON salesperson_custom_field_values;
CREATE POLICY "Own or admin can view field values" ON salesperson_custom_field_values FOR SELECT TO authenticated USING (
  salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())
);

-- Fix inventory tables: restrict to admin/manager
DROP POLICY IF EXISTS "Authenticated users can view inventory levels" ON inventory_levels;
CREATE POLICY "Admin/manager can view inventory levels" ON inventory_levels FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view stock movements" ON stock_movements;
CREATE POLICY "Admin/manager can view stock movements" ON stock_movements FOR SELECT TO authenticated USING (is_admin_or_manager(auth.uid()));

-- Fix prize_wheel_spins: scope to own records or admin/manager
DROP POLICY IF EXISTS "Anyone can read spins" ON prize_wheel_spins;
CREATE POLICY "Own or admin can view spins" ON prize_wheel_spins FOR SELECT TO authenticated USING (
  salesperson_id = get_current_salesperson_id() OR is_admin_or_manager(auth.uid())
);
