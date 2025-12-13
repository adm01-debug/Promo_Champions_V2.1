-- Create table for daily activity goals per salesperson
CREATE TABLE public.activity_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  calls_goal INTEGER NOT NULL DEFAULT 30,
  emails_goal INTEGER NOT NULL DEFAULT 20,
  meetings_goal INTEGER NOT NULL DEFAULT 3,
  linkedin_goal INTEGER NOT NULL DEFAULT 10,
  whatsapp_goal INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(salesperson_id)
);

-- Enable Row Level Security
ALTER TABLE public.activity_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to activity_goals" 
ON public.activity_goals 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to activity_goals" 
ON public.activity_goals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to activity_goals" 
ON public.activity_goals 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to activity_goals" 
ON public.activity_goals 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activity_goals_updated_at
BEFORE UPDATE ON public.activity_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();