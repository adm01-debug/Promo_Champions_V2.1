-- Create weekly_challenges table
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'activity',
  target_value INTEGER NOT NULL DEFAULT 10,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_progress table
CREATE TABLE public.challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  salesperson_id UUID NOT NULL REFERENCES public.salespeople(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  xp_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, salesperson_id)
);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekly_challenges
CREATE POLICY "Authenticated users can read weekly_challenges"
  ON public.weekly_challenges FOR SELECT
  USING (true);

CREATE POLICY "Admins and managers can insert weekly_challenges"
  ON public.weekly_challenges FOR INSERT
  WITH CHECK (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can update weekly_challenges"
  ON public.weekly_challenges FOR UPDATE
  USING (is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins and managers can delete weekly_challenges"
  ON public.weekly_challenges FOR DELETE
  USING (is_admin_or_manager(auth.uid()));

-- RLS policies for challenge_progress
CREATE POLICY "Authenticated users can read challenge_progress"
  ON public.challenge_progress FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert challenge_progress"
  ON public.challenge_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update challenge_progress"
  ON public.challenge_progress FOR UPDATE
  USING (true);

-- Create updated_at triggers
CREATE TRIGGER update_weekly_challenges_updated_at
  BEFORE UPDATE ON public.weekly_challenges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenge_progress_updated_at
  BEFORE UPDATE ON public.challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample weekly challenges
INSERT INTO public.weekly_challenges (title, description, challenge_type, target_value, xp_reward, start_date, end_date) VALUES
('Maratonista de Ligações', 'Complete 50 ligações esta semana', 'calls', 50, 250, date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date),
('Mestre dos E-mails', 'Envie 30 e-mails esta semana', 'emails', 30, 150, date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date),
('Rei das Reuniões', 'Realize 5 reuniões esta semana', 'meetings', 5, 300, date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date),
('Conquistador de Vendas', 'Feche 3 vendas esta semana', 'sales', 3, 500, date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date),
('Networking Pro', 'Faça 20 contatos no LinkedIn', 'linkedin', 20, 200, date_trunc('week', CURRENT_DATE)::date, (date_trunc('week', CURRENT_DATE) + interval '6 days')::date);