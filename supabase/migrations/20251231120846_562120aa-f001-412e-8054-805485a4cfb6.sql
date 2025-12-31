-- Sistema MFA Completo (TOTP + SMS)
-- Tabela de configuração MFA por usuário
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  totp_enabled BOOLEAN DEFAULT FALSE,
  totp_secret TEXT,
  totp_verified_at TIMESTAMPTZ,
  sms_enabled BOOLEAN DEFAULT FALSE,
  phone_number TEXT,
  phone_verified_at TIMESTAMPTZ,
  backup_codes TEXT[],
  backup_codes_generated_at TIMESTAMPTZ,
  preferred_method TEXT DEFAULT 'totp' CHECK (preferred_method IN ('totp', 'sms')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de tentativas de verificação MFA
CREATE TABLE IF NOT EXISTS public.mfa_verification_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('totp', 'sms', 'backup_code')),
  success BOOLEAN DEFAULT FALSE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de códigos SMS pendentes
CREATE TABLE IF NOT EXISTS public.sms_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sistema de Re-autenticação
CREATE TABLE IF NOT EXISTS public.reauthentication_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('password_change', 'email_change', 'mfa_config', 'admin_action', 'delete_account')),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atualizar tabela active_sessions com campos de refresh
ALTER TABLE public.active_sessions 
ADD COLUMN IF NOT EXISTS refresh_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_refresh_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS max_lifetime_hours INTEGER DEFAULT 24;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mfa_settings_user ON public.user_mfa_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_attempts_user ON public.mfa_verification_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_codes_user ON public.sms_verification_codes(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_reauth_user ON public.reauthentication_requests(user_id, expires_at);

-- RLS
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reauthentication_requests ENABLE ROW LEVEL SECURITY;

-- Policies para user_mfa_settings
CREATE POLICY "Users can view own MFA settings"
  ON public.user_mfa_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own MFA settings"
  ON public.user_mfa_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own MFA settings"
  ON public.user_mfa_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies para mfa_verification_attempts
CREATE POLICY "Users can view own MFA attempts"
  ON public.mfa_verification_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert MFA attempts"
  ON public.mfa_verification_attempts FOR INSERT
  WITH CHECK (true);

-- Policies para sms_verification_codes
CREATE POLICY "Users can view own SMS codes"
  ON public.sms_verification_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage SMS codes"
  ON public.sms_verification_codes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policies para reauthentication_requests
CREATE POLICY "Users can view own reauth requests"
  ON public.reauthentication_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reauth requests"
  ON public.reauthentication_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reauth requests"
  ON public.reauthentication_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Função para gerar backup codes
CREATE OR REPLACE FUNCTION public.generate_mfa_backup_codes()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  codes TEXT[] := ARRAY[]::TEXT[];
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    codes := array_append(codes, upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)));
  END LOOP;
  RETURN codes;
END;
$$;

-- Função para verificar se MFA está habilitado
CREATE OR REPLACE FUNCTION public.is_mfa_enabled(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT totp_enabled OR sms_enabled 
     FROM user_mfa_settings 
     WHERE user_id = check_user_id),
    false
  )
$$;

-- Função para validar sessão (24h com refresh)
CREATE OR REPLACE FUNCTION public.validate_session(session_id UUID)
RETURNS TABLE(valid BOOLEAN, needs_refresh BOOLEAN, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  session_record RECORD;
BEGIN
  SELECT * INTO session_record FROM active_sessions WHERE id = session_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, false, 'Session not found'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar se expirou
  IF session_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, false, 'Session expired'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar se precisa refresh (últimas 2 horas antes de expirar)
  IF session_record.expires_at - INTERVAL '2 hours' < NOW() THEN
    RETURN QUERY SELECT true, true, 'Needs refresh'::TEXT;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT true, false, 'Valid'::TEXT;
END;
$$;

-- Função para refresh de sessão
CREATE OR REPLACE FUNCTION public.refresh_session(session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE active_sessions
  SET 
    expires_at = NOW() + INTERVAL '24 hours',
    last_refresh_at = NOW(),
    refresh_count = refresh_count + 1,
    last_activity = NOW()
  WHERE id = session_id
  AND expires_at > NOW();
  
  RETURN FOUND;
END;
$$;

-- Trigger para updated_at
CREATE TRIGGER update_mfa_settings_updated_at
  BEFORE UPDATE ON public.user_mfa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();