-- Additional Performance Indexes

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deals_owner_status_value 
  ON deals(owner_id, status, value DESC);

CREATE INDEX IF NOT EXISTS idx_deals_client_status_date 
  ON deals(client_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activities_user_type_date 
  ON activities(user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_status_due 
  ON tasks(assigned_to, status, due_date);

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_deals_active 
  ON deals(owner_id, stage) 
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_tasks_pending 
  ON tasks(assigned_to, due_date) 
  WHERE status = 'pending';

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm 
  ON clients USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clients_email_trgm 
  ON clients USING gin(email gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_deals_title_trgm 
  ON deals USING gin(title gin_trgm_ops);

-- Covering indexes (include additional columns)
CREATE INDEX IF NOT EXISTS idx_deals_owner_covering 
  ON deals(owner_id) 
  INCLUDE (value, stage, status, expected_close_date);

-- BRIN indexes for large time-series tables
CREATE INDEX IF NOT EXISTS idx_activities_created_brin 
  ON activities USING BRIN(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_brin 
  ON audit_log USING BRIN(created_at);

-- Function for index maintenance
CREATE OR REPLACE FUNCTION reindex_tables()
RETURNS void AS $$
BEGIN
  REINDEX TABLE deals;
  REINDEX TABLE clients;
  REINDEX TABLE activities;
  REINDEX TABLE tasks;
  
  ANALYZE deals;
  ANALYZE clients;
  ANALYZE activities;
  ANALYZE tasks;
END;
$$ LANGUAGE plpgsql;

-- Schedule automatic reindex (if pg_cron available)
-- SELECT cron.schedule('reindex-tables', '0 2 * * 0', 'SELECT reindex_tables()');
