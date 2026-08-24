-- Performance Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_phone ON clients(phone);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_user_id ON deals(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_client_id ON deals(client_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_value ON deals(value);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_client_id ON activities(client_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active ON products(active);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_deals_user_status ON deals(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_user_date ON activities(user_id, created_at DESC);
