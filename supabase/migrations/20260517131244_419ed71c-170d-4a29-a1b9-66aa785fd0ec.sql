-- Add sdr_id and closer_id to sales table
ALTER TABLE public.sales 
ADD COLUMN IF NOT EXISTS sdr_id UUID REFERENCES public.salespeople(id),
ADD COLUMN IF NOT EXISTS closer_id UUID REFERENCES public.salespeople(id);

-- Update RLS policies to allow SDRs to view leads they prospected
-- First, drop the existing restrictive select policy if it exists
-- We'll use a more inclusive one

CREATE POLICY "SDRs can view leads they prospected" 
ON public.sales 
FOR SELECT 
USING (
    sdr_id IN (SELECT id FROM salespeople WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Closers can view leads assigned to them" 
ON public.sales 
FOR SELECT 
USING (
    closer_id IN (SELECT id FROM salespeople WHERE auth_user_id = auth.uid())
);

-- Ensure salesperson_id still works as a primary owner
-- (already exists in current policies)

-- Trigger to automatically set sdr_id on insert if the creator is an SDR
CREATE OR REPLACE FUNCTION public.set_sdr_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sdr_id IS NULL THEN
        SELECT id INTO NEW.sdr_id 
        FROM salespeople 
        WHERE auth_user_id = auth.uid() AND role IN ('sdr', 'hybrid');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_set_sdr_id
BEFORE INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.set_sdr_id_on_insert();
