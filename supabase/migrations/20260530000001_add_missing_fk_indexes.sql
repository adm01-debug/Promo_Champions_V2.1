-- Add missing indexes on foreign keys to prevent sequential scans on joins

-- FK indexes for sales table
CREATE INDEX IF NOT EXISTS idx_sales_salesperson_id ON sales(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_salesperson_status ON sales(salesperson_id, status);

-- FK indexes for activities table
CREATE INDEX IF NOT EXISTS idx_activities_salesperson_id ON activities(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_salesperson_type ON activities(salesperson_id, activity_type);

-- FK indexes for sales_goals table
CREATE INDEX IF NOT EXISTS idx_sales_goals_salesperson_id ON sales_goals(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sales_goals_month ON sales_goals(month);
CREATE INDEX IF NOT EXISTS idx_sales_goals_sp_month ON sales_goals(salesperson_id, month);

-- FK indexes for activity_goals table
CREATE INDEX IF NOT EXISTS idx_activity_goals_salesperson_id ON activity_goals(salesperson_id);

-- FK indexes for achievements table
CREATE INDEX IF NOT EXISTS idx_achievements_salesperson_id ON achievements(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievements_date ON achievements(achievement_date);
CREATE INDEX IF NOT EXISTS idx_achievements_sp_type_date ON achievements(salesperson_id, achievement_type, achievement_date);

-- FK indexes for conversation_analyses table
CREATE INDEX IF NOT EXISTS idx_conversation_analyses_analyzed_by ON conversation_analyses(analyzed_by);
CREATE INDEX IF NOT EXISTS idx_conversation_analyses_created_at ON conversation_analyses(created_at);
