-- Enhanced Soft Delete System
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create views for active records
CREATE OR REPLACE VIEW deals_active AS
  SELECT * FROM deals WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW clients_active AS
  SELECT * FROM clients WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW activities_active AS
  SELECT * FROM activities WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW tasks_active AS
  SELECT * FROM tasks WHERE deleted_at IS NULL;

-- Restore function
CREATE OR REPLACE FUNCTION restore_record(table_name TEXT, record_id UUID)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = NULL WHERE id = $1', table_name)
  USING record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-cleanup job (delete records after 90 days)
CREATE OR REPLACE FUNCTION cleanup_deleted_records()
RETURNS void AS $$
BEGIN
  DELETE FROM deals WHERE deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM clients WHERE deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM activities WHERE deleted_at < NOW() - INTERVAL '90 days';
  DELETE FROM tasks WHERE deleted_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
