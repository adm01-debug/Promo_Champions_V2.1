-- =====================================================
-- MIGRATION: Comprehensive Audit Trail System
-- Description: Complete audit logging with triggers
-- Author: SalesPro Team
-- Date: 2024-12-28
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT')),
  table_name VARCHAR(100) NOT NULL,
  record_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changes JSONB, -- Specific fields that changed
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create audit log summary for analytics
CREATE TABLE IF NOT EXISTS audit_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  action_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  tables_affected TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Create sensitive operations log
CREATE TABLE IF NOT EXISTS sensitive_operations_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  operation_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id TEXT NOT NULL,
  approved_by UUID REFERENCES auth.users(id),
  reason TEXT,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_severity ON audit_log(severity) WHERE severity IN ('warning', 'critical');

CREATE INDEX IF NOT EXISTS idx_audit_summary_user_date ON audit_summary(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sensitive_ops_user ON sensitive_operations_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensitive_ops_resource ON sensitive_operations_log(resource_type, resource_id);

-- Partitioning by month for performance (optional, for high-volume systems)
-- CREATE TABLE audit_log_y2024m12 PARTITION OF audit_log
--   FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensitive_operations_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Audit trigger function with field-level tracking
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_changes JSONB := '{}'::jsonb;
  v_old_val TEXT;
  v_new_val TEXT;
  v_key TEXT;
BEGIN
  -- Calculate specific changes for UPDATE
  IF TG_OP = 'UPDATE' THEN
    FOR v_key IN SELECT jsonb_object_keys(to_jsonb(NEW))
    LOOP
      v_old_val := (to_jsonb(OLD) ->> v_key);
      v_new_val := (to_jsonb(NEW) ->> v_key);
      
      IF v_old_val IS DISTINCT FROM v_new_val THEN
        v_changes := v_changes || jsonb_build_object(
          v_key,
          jsonb_build_object(
            'old', v_old_val,
            'new', v_new_val
          )
        );
      END IF;
    END LOOP;
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    changes,
    ip_address,
    severity
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    CASE WHEN TG_OP = 'UPDATE' THEN v_changes ELSE NULL END,
    inet_client_addr(),
    CASE 
      WHEN TG_TABLE_NAME IN ('users', 'roles', 'permissions') THEN 'critical'
      WHEN TG_OP = 'DELETE' THEN 'warning'
      ELSE 'info'
    END
  );
  
  -- Update audit summary
  INSERT INTO audit_summary (user_id, date, action_counts, tables_affected)
  VALUES (
    auth.uid(),
    CURRENT_DATE,
    jsonb_build_object(TG_OP, 1),
    ARRAY[TG_TABLE_NAME]
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    action_counts = audit_summary.action_counts || 
      jsonb_build_object(
        TG_OP,
        COALESCE((audit_summary.action_counts ->> TG_OP)::int, 0) + 1
      ),
    tables_affected = array_append(
      audit_summary.tables_affected,
      TG_TABLE_NAME
    );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to critical tables
CREATE TRIGGER audit_deals
  AFTER INSERT OR UPDATE OR DELETE ON deals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_clients
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_activities
  AFTER INSERT OR UPDATE OR DELETE ON activities
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Function to get user activity report
CREATE OR REPLACE FUNCTION get_user_activity_report(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  total_actions BIGINT,
  actions_by_type JSONB,
  tables_modified TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.date,
    (s.action_counts ->> 'INSERT')::bigint +
    (s.action_counts ->> 'UPDATE')::bigint +
    (s.action_counts ->> 'DELETE')::bigint AS total_actions,
    s.action_counts,
    s.tables_affected
  FROM audit_summary s
  WHERE s.user_id = p_user_id
    AND s.date >= p_start_date
    AND s.date <= p_end_date
  ORDER BY s.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent changes for a record
CREATE OR REPLACE FUNCTION get_record_history(
  p_table_name VARCHAR,
  p_record_id TEXT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  action VARCHAR,
  user_email TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.action,
    u.email,
    a.changes,
    a.created_at
  FROM audit_log a
  LEFT JOIN auth.users u ON u.id = a.user_id
  WHERE a.table_name = p_table_name
    AND a.record_id = p_record_id
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  suspicious_patterns TEXT[],
  action_count BIGINT,
  last_action TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_activity AS (
    SELECT
      a.user_id,
      u.email,
      COUNT(*) as action_count,
      MAX(a.created_at) as last_action,
      COUNT(*) FILTER (WHERE a.action = 'DELETE') as delete_count,
      COUNT(*) FILTER (WHERE a.severity = 'critical') as critical_count,
      COUNT(DISTINCT a.ip_address) as ip_count
    FROM audit_log a
    LEFT JOIN auth.users u ON u.id = a.user_id
    WHERE a.created_at >= NOW() - INTERVAL '1 hour'
    GROUP BY a.user_id, u.email
  )
  SELECT
    ra.user_id,
    ra.email,
    ARRAY[
      CASE WHEN ra.delete_count > 10 THEN 'Excessive deletions' END,
      CASE WHEN ra.critical_count > 5 THEN 'Multiple critical operations' END,
      CASE WHEN ra.action_count > 100 THEN 'Unusually high activity' END,
      CASE WHEN ra.ip_count > 3 THEN 'Multiple IP addresses' END
    ]::TEXT[] as suspicious_patterns,
    ra.action_count,
    ra.last_action
  FROM recent_activity ra
  WHERE ra.delete_count > 10
     OR ra.critical_count > 5
     OR ra.action_count > 100
     OR ra.ip_count > 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON audit_log TO authenticated;
GRANT SELECT ON audit_summary TO authenticated;
GRANT INSERT ON sensitive_operations_log TO authenticated;

-- Comments
COMMENT ON TABLE audit_log IS 'Complete audit trail of all data changes';
COMMENT ON TABLE audit_summary IS 'Daily summary of user actions for analytics';
COMMENT ON TABLE sensitive_operations_log IS 'Log of sensitive operations requiring approval';
COMMENT ON FUNCTION audit_trigger IS 'Trigger function to log all data modifications';
COMMENT ON FUNCTION get_user_activity_report IS 'Generate activity report for a user';
COMMENT ON FUNCTION get_record_history IS 'Get complete change history for a record';
COMMENT ON FUNCTION detect_suspicious_activity IS 'Detect potentially suspicious user activity';
