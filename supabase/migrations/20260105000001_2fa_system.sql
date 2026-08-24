-- =====================================================
-- SEC-002: 2FA Migration Complete
-- Descrição: Sistema completo de autenticação 2FA
-- =====================================================

-- 1. Tabela principal de 2FA
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  backup_codes_used INTEGER DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_enabled ON user_2fa(enabled);

ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own 2FA settings"
  ON user_2fa FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own 2FA settings"
  ON user_2fa FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own 2FA settings"
  ON user_2fa FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Tabela de log de verificações
CREATE TABLE IF NOT EXISTS user_2fa_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_2fa_log_user ON user_2fa_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_2fa_log_created ON user_2fa_log(created_at DESC);

-- 3. Tabela de backup codes
CREATE TABLE IF NOT EXISTS user_2fa_backup_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_backup_codes_user ON user_2fa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_codes_used ON user_2fa_backup_codes(used, user_id);

ALTER TABLE user_2fa_backup_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own backup codes"
  ON user_2fa_backup_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own backup codes"
  ON user_2fa_backup_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_2fa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_2fa_updated_at
  BEFORE UPDATE ON user_2fa
  FOR EACH ROW
  EXECUTE FUNCTION update_2fa_updated_at();

-- 5. Função para verificar tentativas falhadas
CREATE OR REPLACE FUNCTION check_2fa_failed_attempts(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  failed_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO failed_count
  FROM user_2fa_log
  WHERE user_id = p_user_id
    AND success = false
    AND created_at > now() - INTERVAL '15 minutes';
  
  RETURN failed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
