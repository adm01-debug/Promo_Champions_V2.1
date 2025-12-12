-- Add INSERT, UPDATE, DELETE policies for salespeople
CREATE POLICY "Allow public insert to salespeople" ON public.salespeople
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to salespeople" ON public.salespeople
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to salespeople" ON public.salespeople
  FOR DELETE USING (true);

-- Add INSERT, UPDATE, DELETE policies for sales_goals
CREATE POLICY "Allow public insert to sales_goals" ON public.sales_goals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to sales_goals" ON public.sales_goals
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to sales_goals" ON public.sales_goals
  FOR DELETE USING (true);