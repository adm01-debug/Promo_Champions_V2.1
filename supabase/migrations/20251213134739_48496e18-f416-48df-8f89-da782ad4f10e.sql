-- Create achievements history table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL DEFAULT 'daily_goal',
  achievement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to achievements" 
ON public.achievements 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to achievements" 
ON public.achievements 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_achievements_salesperson ON public.achievements(salesperson_id);
CREATE INDEX idx_achievements_date ON public.achievements(achievement_date DESC);