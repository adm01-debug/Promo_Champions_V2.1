-- Create cadences table (sequence templates)
CREATE TABLE public.cadences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cadence steps table
CREATE TABLE public.cadence_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cadence_id UUID NOT NULL REFERENCES public.cadences(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  action_type TEXT NOT NULL CHECK (action_type IN ('email', 'call', 'linkedin', 'whatsapp', 'meeting', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  template_content TEXT,
  step_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prospect cadences table (enrollment tracking)
CREATE TABLE public.prospect_cadences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  cadence_id UUID NOT NULL REFERENCES public.cadences(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.salespeople(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_step INTEGER NOT NULL DEFAULT 0,
  next_action_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sale_id, cadence_id)
);

-- Create cadence tasks table (generated tasks from steps)
CREATE TABLE public.cadence_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prospect_cadence_id UUID NOT NULL REFERENCES public.prospect_cadences(id) ON DELETE CASCADE,
  cadence_step_id UUID NOT NULL REFERENCES public.cadence_steps(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadence_tasks ENABLE ROW LEVEL SECURITY;

-- Cadences policies
CREATE POLICY "Allow public read access to cadences" ON public.cadences FOR SELECT USING (true);
CREATE POLICY "Allow public insert to cadences" ON public.cadences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to cadences" ON public.cadences FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to cadences" ON public.cadences FOR DELETE USING (true);

-- Cadence steps policies
CREATE POLICY "Allow public read access to cadence_steps" ON public.cadence_steps FOR SELECT USING (true);
CREATE POLICY "Allow public insert to cadence_steps" ON public.cadence_steps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to cadence_steps" ON public.cadence_steps FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to cadence_steps" ON public.cadence_steps FOR DELETE USING (true);

-- Prospect cadences policies
CREATE POLICY "Allow public read access to prospect_cadences" ON public.prospect_cadences FOR SELECT USING (true);
CREATE POLICY "Allow public insert to prospect_cadences" ON public.prospect_cadences FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to prospect_cadences" ON public.prospect_cadences FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to prospect_cadences" ON public.prospect_cadences FOR DELETE USING (true);

-- Cadence tasks policies
CREATE POLICY "Allow public read access to cadence_tasks" ON public.cadence_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert to cadence_tasks" ON public.cadence_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to cadence_tasks" ON public.cadence_tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to cadence_tasks" ON public.cadence_tasks FOR DELETE USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_cadences_updated_at BEFORE UPDATE ON public.cadences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prospect_cadences_updated_at BEFORE UPDATE ON public.prospect_cadences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();