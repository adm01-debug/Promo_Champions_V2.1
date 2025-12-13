-- Create XP and levels table for salespeople
CREATE TABLE public.salesperson_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL UNIQUE REFERENCES public.salespeople(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create XP history table for tracking XP gains
CREATE TABLE public.xp_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  source_type TEXT NOT NULL, -- 'sale', 'achievement', 'streak', 'bonus'
  source_id TEXT, -- Optional reference to source (sale_id, achievement_id)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salesperson_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for salesperson_xp
CREATE POLICY "Allow public read access to salesperson_xp" 
ON public.salesperson_xp FOR SELECT USING (true);

CREATE POLICY "Allow public insert to salesperson_xp" 
ON public.salesperson_xp FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to salesperson_xp" 
ON public.salesperson_xp FOR UPDATE USING (true);

-- RLS Policies for xp_history
CREATE POLICY "Allow public read access to xp_history" 
ON public.xp_history FOR SELECT USING (true);

CREATE POLICY "Allow public insert to xp_history" 
ON public.xp_history FOR INSERT WITH CHECK (true);

-- Create trigger for updating timestamps
CREATE TRIGGER update_salesperson_xp_updated_at
BEFORE UPDATE ON public.salesperson_xp
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for XP updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.salesperson_xp;