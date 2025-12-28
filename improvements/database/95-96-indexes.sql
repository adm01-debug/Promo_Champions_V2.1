-- Melhorias 95-96 - Performance Indexes

-- 95: Deals indexes
CREATE INDEX IF NOT EXISTS idx_deals_assigned_stage ON deals(assigned_to, stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_client_status ON deals(client_id, status);
CREATE INDEX IF NOT EXISTS idx_deals_created_date ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value DESC);

-- 96: Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type, created_at DESC);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- ANALYZE tables
ANALYZE deals;
ANALYZE activities;
ANALYZE tasks;
