-- Enable realtime for sales table to track new sales
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;

-- Add auth_user_id to salespeople table to link with auth.users
ALTER TABLE public.salespeople 
ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_salespeople_auth_user_id ON public.salespeople(auth_user_id);

-- Create RLS policies for insert/update/delete on sales (currently only SELECT is allowed)
CREATE POLICY "Allow authenticated insert to sales" 
ON public.sales 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to sales" 
ON public.sales 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete to sales" 
ON public.sales 
FOR DELETE 
TO authenticated
USING (true);