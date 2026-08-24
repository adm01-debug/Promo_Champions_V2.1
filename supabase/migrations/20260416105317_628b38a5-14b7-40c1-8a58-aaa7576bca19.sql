
CREATE TABLE public.nps_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE SET NULL,
  survey_type TEXT NOT NULL DEFAULT 'nps' CHECK (survey_type IN ('nps', 'csat')),
  score INTEGER CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded')),
  sent_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nps_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view nps surveys"
  ON public.nps_surveys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create nps surveys"
  ON public.nps_surveys FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update nps surveys"
  ON public.nps_surveys FOR UPDATE
  TO authenticated
  USING (true);

CREATE INDEX idx_nps_surveys_sale_id ON public.nps_surveys(sale_id);
CREATE INDEX idx_nps_surveys_salesperson_id ON public.nps_surveys(salesperson_id);
