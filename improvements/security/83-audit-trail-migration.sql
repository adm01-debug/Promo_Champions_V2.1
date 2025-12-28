-- Melhoria 83 - Audit Trail Completo
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_table ON audit_log(table_name, created_at DESC);

-- Trigger function
CREATE OR REPLACE FUNCTION audit_trigger() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), to_jsonb(OLD), to_jsonb(NEW));
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply to critical tables
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_deals AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER audit_activities AFTER INSERT OR UPDATE OR DELETE ON activities
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();
