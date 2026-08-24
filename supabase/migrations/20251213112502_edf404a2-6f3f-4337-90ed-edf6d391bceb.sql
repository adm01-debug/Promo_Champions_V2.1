-- Create lead_scores table to store scoring data
CREATE TABLE public.lead_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  factors JSONB NOT NULL DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sale_id)
);

-- Enable RLS
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to lead_scores"
ON public.lead_scores FOR SELECT USING (true);

CREATE POLICY "Allow public insert to lead_scores"
ON public.lead_scores FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to lead_scores"
ON public.lead_scores FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to lead_scores"
ON public.lead_scores FOR DELETE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_lead_scores_updated_at
BEFORE UPDATE ON public.lead_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();