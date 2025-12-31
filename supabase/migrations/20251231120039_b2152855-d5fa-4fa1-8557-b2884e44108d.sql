-- ============================================
-- MÓDULO DE SEGURANÇA AVANÇADA
-- ============================================

-- 1. Tabela de tentativas de login (para bloqueio após falhas)
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_created ON login_attempts(created_at DESC);

-- 2. Tabela de Rate Limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL DEFAULT 'ip',
  action TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_end TIMESTAMPTZ,
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_identifier ON rate_limit_logs(identifier, action);
CREATE INDEX idx_rate_limit_window ON rate_limit_logs(window_start, window_end);

-- 3. Tabela de IPs Bloqueados
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_by UUID REFERENCES auth.users(id),
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_permanent BOOLEAN DEFAULT FALSE,
  block_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocked_ips_address ON blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_expires ON blocked_ips(expires_at);

-- 4. Tabela de Whitelist de IPs
CREATE TABLE IF NOT EXISTS public.ip_whitelist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  description TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Configurações de Rate Limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL UNIQUE,
  max_requests INTEGER NOT NULL DEFAULT 100,
  window_seconds INTEGER NOT NULL DEFAULT 3600,
  block_duration_seconds INTEGER NOT NULL DEFAULT 3600,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO public.rate_limit_settings (action, max_requests, window_seconds, block_duration_seconds) VALUES
  ('login', 5, 300, 900),
  ('signup', 3, 3600, 7200),
  ('password_reset', 3, 3600, 3600),
  ('api_call', 100, 60, 300),
  ('export', 10, 3600, 1800)
ON CONFLICT (action) DO NOTHING;

-- 6. Tabela de Sessões Ativas (para monitoramento)
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX idx_active_sessions_activity ON active_sessions(last_activity);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- login_attempts: Admins podem ver tudo, sistema pode inserir
CREATE POLICY "Admins can view login_attempts"
  ON login_attempts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert login_attempts"
  ON login_attempts FOR INSERT
  WITH CHECK (true);

-- rate_limit_logs: Admins podem ver
CREATE POLICY "Admins can view rate_limit_logs"
  ON rate_limit_logs FOR SELECT
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "System can manage rate_limit_logs"
  ON rate_limit_logs FOR ALL
  USING (true)
  WITH CHECK (true);

-- blocked_ips: Admins podem gerenciar
CREATE POLICY "Admins can manage blocked_ips"
  ON blocked_ips FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ip_whitelist: Admins podem gerenciar
CREATE POLICY "Admins can manage ip_whitelist"
  ON ip_whitelist FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- rate_limit_settings: Admins podem ver e editar
CREATE POLICY "Admins can manage rate_limit_settings"
  ON rate_limit_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view rate_limit_settings"
  ON rate_limit_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- active_sessions: Usuários veem suas próprias, admins veem todas
CREATE POLICY "Users can view own sessions"
  ON active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON active_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage sessions"
  ON active_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para verificar se IP está bloqueado
CREATE OR REPLACE FUNCTION public.is_ip_blocked(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocked_ips
    WHERE ip_address = check_ip
    AND (is_permanent = true OR expires_at > NOW())
  )
$$;

-- Função para verificar se IP está na whitelist
CREATE OR REPLACE FUNCTION public.is_ip_whitelisted(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM ip_whitelist
    WHERE ip_address = check_ip
  )
$$;

-- Função para contar tentativas de login falhas
CREATE OR REPLACE FUNCTION public.count_failed_login_attempts(
  check_email TEXT,
  check_ip TEXT,
  window_minutes INTEGER DEFAULT 15
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM login_attempts
  WHERE (email = check_email OR ip_address = check_ip)
  AND success = false
  AND created_at > NOW() - (window_minutes || ' minutes')::INTERVAL
$$;

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action TEXT
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings RECORD;
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Buscar configurações
  SELECT * INTO v_settings FROM rate_limit_settings WHERE action = p_action AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT true, 999, NOW() + INTERVAL '1 hour';
    RETURN;
  END IF;
  
  v_window_start := NOW() - (v_settings.window_seconds || ' seconds')::INTERVAL;
  
  -- Contar requests na janela
  SELECT COUNT(*) INTO v_count
  FROM rate_limit_logs
  WHERE identifier = p_identifier
  AND action = p_action
  AND created_at > v_window_start;
  
  IF v_count >= v_settings.max_requests THEN
    RETURN QUERY SELECT false, 0, NOW() + (v_settings.block_duration_seconds || ' seconds')::INTERVAL;
  ELSE
    RETURN QUERY SELECT true, (v_settings.max_requests - v_count - 1), v_window_start + (v_settings.window_seconds || ' seconds')::INTERVAL;
  END IF;
END;
$$;

-- Função para registrar tentativa de rate limit
CREATE OR REPLACE FUNCTION public.log_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_action TEXT,
  p_blocked BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO rate_limit_logs (identifier, identifier_type, action, blocked)
  VALUES (p_identifier, p_identifier_type, p_action, p_blocked);
END;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_blocked_ips_updated_at
  BEFORE UPDATE ON blocked_ips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ip_whitelist_updated_at
  BEFORE UPDATE ON ip_whitelist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limit_settings_updated_at
  BEFORE UPDATE ON rate_limit_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();