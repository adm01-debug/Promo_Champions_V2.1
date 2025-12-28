-- Melhorias 95-96 - Performance Indexes

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_assigned_stage 
  ON deals(assigned_to, stage_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deals_client_status 
  ON deals(client_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deals_created_date 
  ON deals(created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deals_value 
  ON deals(value DESC) WHERE status = 'won';

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_date 
  ON activities(user_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activities_deal 
  ON activities(deal_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activities_type 
  ON activities(type, created_at DESC) WHERE deleted_at IS NULL;

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_status 
  ON tasks(assigned_to, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_due_date 
  ON tasks(due_date) WHERE status != 'done' AND deleted_at IS NULL;

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_name 
  ON clients(name) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_clients_created 
  ON clients(created_at DESC) WHERE deleted_at IS NULL;

-- Analyze tables for query planner
ANALYZE deals;
ANALYZE activities;
ANALYZE tasks;
ANALYZE clients;
