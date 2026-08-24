-- Remove ALL remaining public access policies and replace with authenticated-only policies

-- cadence_steps: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public delete to cadence_steps" ON public.cadence_steps;
DROP POLICY IF EXISTS "Allow public insert to cadence_steps" ON public.cadence_steps;
DROP POLICY IF EXISTS "Allow public read access to cadence_steps" ON public.cadence_steps;
DROP POLICY IF EXISTS "Allow public update to cadence_steps" ON public.cadence_steps;

CREATE POLICY "Authenticated users can read cadence_steps" ON public.cadence_steps
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert cadence_steps" ON public.cadence_steps
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update cadence_steps" ON public.cadence_steps
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete cadence_steps" ON public.cadence_steps
  FOR DELETE TO authenticated USING (true);

-- cadences: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public delete to cadences" ON public.cadences;
DROP POLICY IF EXISTS "Allow public insert to cadences" ON public.cadences;
DROP POLICY IF EXISTS "Allow public read access to cadences" ON public.cadences;
DROP POLICY IF EXISTS "Allow public update to cadences" ON public.cadences;

CREATE POLICY "Authenticated users can read cadences" ON public.cadences
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert cadences" ON public.cadences
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update cadences" ON public.cadences
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete cadences" ON public.cadences
  FOR DELETE TO authenticated USING (true);

-- category_metrics: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public read access to category_metrics" ON public.category_metrics;

CREATE POLICY "Authenticated users can read category_metrics" ON public.category_metrics
  FOR SELECT TO authenticated USING (true);

-- daily_metrics: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public read access to daily_metrics" ON public.daily_metrics;

CREATE POLICY "Authenticated users can read daily_metrics" ON public.daily_metrics
  FOR SELECT TO authenticated USING (true);

-- products: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public delete to products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public update to products" ON public.products;

CREATE POLICY "Authenticated users can read products" ON public.products
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON public.products
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete products" ON public.products
  FOR DELETE TO authenticated USING (true);

-- playbooks: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public delete to playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Allow public insert to playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Allow public read access to playbooks" ON public.playbooks;
DROP POLICY IF EXISTS "Allow public update to playbooks" ON public.playbooks;

CREATE POLICY "Authenticated users can read playbooks" ON public.playbooks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert playbooks" ON public.playbooks
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update playbooks" ON public.playbooks
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete playbooks" ON public.playbooks
  FOR DELETE TO authenticated USING (true);

-- playbook_items: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public delete to playbook_items" ON public.playbook_items;
DROP POLICY IF EXISTS "Allow public insert to playbook_items" ON public.playbook_items;
DROP POLICY IF EXISTS "Allow public read access to playbook_items" ON public.playbook_items;
DROP POLICY IF EXISTS "Allow public update to playbook_items" ON public.playbook_items;

CREATE POLICY "Authenticated users can read playbook_items" ON public.playbook_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert playbook_items" ON public.playbook_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update playbook_items" ON public.playbook_items
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete playbook_items" ON public.playbook_items
  FOR DELETE TO authenticated USING (true);

-- objections_library: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public delete to objections_library" ON public.objections_library;
DROP POLICY IF EXISTS "Allow public insert to objections_library" ON public.objections_library;
DROP POLICY IF EXISTS "Allow public read access to objections_library" ON public.objections_library;
DROP POLICY IF EXISTS "Allow public update to objections_library" ON public.objections_library;

CREATE POLICY "Authenticated users can read objections_library" ON public.objections_library
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert objections_library" ON public.objections_library
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update objections_library" ON public.objections_library
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete objections_library" ON public.objections_library
  FOR DELETE TO authenticated USING (true);

-- deal_stage_history: Remove public policies and add authenticated
DROP POLICY IF EXISTS "Allow public insert to deal_stage_history" ON public.deal_stage_history;
DROP POLICY IF EXISTS "Allow public read access to deal_stage_history" ON public.deal_stage_history;
DROP POLICY IF EXISTS "Allow public update to deal_stage_history" ON public.deal_stage_history;

CREATE POLICY "Authenticated users can read deal_stage_history" ON public.deal_stage_history
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert deal_stage_history" ON public.deal_stage_history
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update deal_stage_history" ON public.deal_stage_history
  FOR UPDATE TO authenticated USING (true);