-- Melhoria 82 - 2FA Two-Factor Authentication

-- Tabela de configuração 2FA
CREATE TABLE IF NOT EXISTS user_2fa (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de tentativas de verificação
CREATE TABLE IF NOT EXISTS 2fa_verification_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  success BOOLEAN DEFAULT FALSE,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para performance
CREATE INDEX idx_2fa_user ON user_2fa(user_id);
CREATE INDEX idx_2fa_attempts_user ON 2fa_verification_attempts(user_id, created_at DESC);

-- RLS
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE 2fa_verification_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own 2FA"
  ON user_2fa FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own 2FA"
  ON user_2fa FOR UPDATE
  USING (auth.uid() = user_id);

-- Atualizar timestamp
CREATE TRIGGER update_user_2fa_updated_at
  BEFORE UPDATE ON user_2fa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
