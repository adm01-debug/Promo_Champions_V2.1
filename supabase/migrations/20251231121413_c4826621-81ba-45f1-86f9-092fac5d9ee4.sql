-- Tabela de dispositivos conhecidos do usuário
CREATE TABLE IF NOT EXISTS public.known_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  location TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_trusted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

-- Tabela de alertas de login suspeito
CREATE TABLE IF NOT EXISTS public.login_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT,
  browser TEXT,
  os TEXT,
  location TEXT,
  alert_type TEXT DEFAULT 'new_device' CHECK (alert_type IN ('new_device', 'new_ip', 'new_location', 'suspicious')),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_known_devices_user ON public.known_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_known_devices_fingerprint ON public.known_devices(device_fingerprint);
CREATE INDEX IF NOT EXISTS idx_login_alerts_user ON public.login_alerts(user_id, created_at DESC);

-- RLS
ALTER TABLE public.known_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_alerts ENABLE ROW LEVEL SECURITY;

-- Policies para known_devices
CREATE POLICY "Users can view own devices"
  ON public.known_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON public.known_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON public.known_devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON public.known_devices FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para login_alerts
CREATE POLICY "Users can view own alerts"
  ON public.login_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.login_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts"
  ON public.login_alerts FOR INSERT
  WITH CHECK (true);

-- Função para gerar fingerprint do dispositivo
CREATE OR REPLACE FUNCTION public.generate_device_fingerprint(
  p_user_agent TEXT,
  p_ip_address TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(sha256((COALESCE(p_user_agent, '') || COALESCE(p_ip_address, ''))::bytea), 'hex');
END;
$$;

-- Função para verificar se dispositivo é conhecido
CREATE OR REPLACE FUNCTION public.is_known_device(
  p_user_id UUID,
  p_fingerprint TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM known_devices
    WHERE user_id = p_user_id
    AND device_fingerprint = p_fingerprint
  )
$$;