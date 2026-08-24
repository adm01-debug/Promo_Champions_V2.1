-- Additional Security Enhancements

-- Password History (prevent reuse)
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_password_history_user ON password_history(user_id);

-- Login Attempts (brute force protection)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address INET,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email, created_at);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at);

-- Function to check failed login attempts
CREATE OR REPLACE FUNCTION check_failed_attempts(p_email TEXT, p_minutes INTEGER DEFAULT 15)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL;
$$ LANGUAGE SQL;

-- Session Activity Log
CREATE TABLE IF NOT EXISTS session_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_session_activity_user ON session_activity(user_id, created_at);

-- Data Access Log
CREATE TABLE IF NOT EXISTS data_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL CHECK (action IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_data_access_user ON data_access_log(user_id, created_at);
CREATE INDEX idx_data_access_table ON data_access_log(table_name, created_at);

-- Function to log data access
CREATE OR REPLACE FUNCTION log_data_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO data_access_log (user_id, table_name, record_id, action)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply data access logging to sensitive tables
CREATE TRIGGER log_clients_access
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION log_data_access();

CREATE TRIGGER log_deals_access
  AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW EXECUTE FUNCTION log_data_access();

-- RLS Policies
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own password history (hashes only)
CREATE POLICY "Users can view own password history"
  ON password_history FOR SELECT
  USING (auth.uid() = user_id);

-- Only admins can view login attempts
CREATE POLICY "Admins can view login attempts"
  ON login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view their own session activity
CREATE POLICY "Users can view own session activity"
  ON session_activity FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own data access log
CREATE POLICY "Users can view own data access"
  ON data_access_log FOR SELECT
  USING (auth.uid() = user_id);
