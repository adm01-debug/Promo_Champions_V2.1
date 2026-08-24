-- Create enum for activity types
CREATE TYPE public.activity_type AS ENUM ('call', 'email', 'meeting', 'linkedin', 'whatsapp', 'other');

-- Create enum for activity outcomes
CREATE TYPE public.activity_outcome AS ENUM ('connected', 'no_answer', 'scheduled', 'voicemail', 'busy', 'callback', 'not_interested', 'qualified');

-- Create activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  outcome activity_outcome NOT NULL,
  notes TEXT,
  duration_minutes INTEGER,
  contact_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to activities" 
ON public.activities 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert to activities" 
ON public.activities 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update to activities" 
ON public.activities 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete to activities" 
ON public.activities 
FOR DELETE 
USING (true);

-- Create index for faster queries
CREATE INDEX idx_activities_sale_id ON public.activities(sale_id);
CREATE INDEX idx_activities_salesperson_id ON public.activities(salesperson_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);