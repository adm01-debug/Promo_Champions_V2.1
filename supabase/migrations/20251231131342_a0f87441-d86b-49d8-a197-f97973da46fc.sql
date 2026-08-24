-- Tabela para solicitações de reset de senha com aprovação
CREATE TABLE public.password_reset_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'expired')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  rejection_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage all requests
CREATE POLICY "Admins can manage password_reset_requests"
  ON public.password_reset_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Users can insert their own requests (public, no auth required for reset request)
CREATE POLICY "Anyone can request password reset"
  ON public.password_reset_requests
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own requests by email
CREATE POLICY "Users can view own requests"
  ON public.password_reset_requests
  FOR SELECT
  USING (user_email = get_current_user_email());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_password_reset_requests_updated_at
  BEFORE UPDATE ON public.password_reset_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar se há request pendente recente (anti-spam)
CREATE OR REPLACE FUNCTION public.has_pending_reset_request(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM password_reset_requests
    WHERE user_email = check_email
    AND status = 'pending'
    AND expires_at > NOW()
  )
$$;

-- Função para contar requests nas últimas 24h (rate limiting)
CREATE OR REPLACE FUNCTION public.count_reset_requests_24h(check_email TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM password_reset_requests
  WHERE user_email = check_email
  AND requested_at > NOW() - INTERVAL '24 hours'
$$;