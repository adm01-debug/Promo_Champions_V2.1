-- Additional Performance Indexes

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_deals_user_status 
ON deals(user_id, status) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_deals_created_status 
ON deals(created_at DESC, status) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_activities_user_date 
ON activities(user_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY idx_clients_user_active 
ON clients(user_id) WHERE deleted_at IS NULL AND active = true;

-- Full text search indexes
CREATE INDEX CONCURRENTLY idx_clients_name_search 
ON clients USING gin(to_tsvector('portuguese', name));

CREATE INDEX CONCURRENTLY idx_deals_title_search 
ON deals USING gin(to_tsvector('portuguese', title));
