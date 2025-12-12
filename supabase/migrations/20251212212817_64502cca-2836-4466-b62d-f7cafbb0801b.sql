-- Create table for win/loss reasons
CREATE TABLE public.deal_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
  outcome TEXT NOT NULL CHECK (outcome IN ('won', 'lost')),
  reason TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for deal stage history (for velocity tracking)
CREATE TABLE public.deal_stage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  entered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exited_at TIMESTAMP WITH TIME ZONE
);

-- Create table for objections library
CREATE TABLE public.objections_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  objection TEXT NOT NULL,
  response TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  effectiveness_score INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.salespeople(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deal_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objections_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal_outcomes
CREATE POLICY "Allow public read access to deal_outcomes" ON public.deal_outcomes FOR SELECT USING (true);
CREATE POLICY "Allow public insert to deal_outcomes" ON public.deal_outcomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to deal_outcomes" ON public.deal_outcomes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to deal_outcomes" ON public.deal_outcomes FOR DELETE USING (true);

-- RLS Policies for deal_stage_history
CREATE POLICY "Allow public read access to deal_stage_history" ON public.deal_stage_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert to deal_stage_history" ON public.deal_stage_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to deal_stage_history" ON public.deal_stage_history FOR UPDATE USING (true);

-- RLS Policies for objections_library
CREATE POLICY "Allow public read access to objections_library" ON public.objections_library FOR SELECT USING (true);
CREATE POLICY "Allow public insert to objections_library" ON public.objections_library FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to objections_library" ON public.objections_library FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to objections_library" ON public.objections_library FOR DELETE USING (true);

-- Trigger for updated_at on objections_library
CREATE TRIGGER update_objections_library_updated_at
BEFORE UPDATE ON public.objections_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();