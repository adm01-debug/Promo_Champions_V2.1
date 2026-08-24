
-- =====================================================
-- PERFORMANCE OPTIMIZATION: Add indexes for common queries
-- =====================================================

-- Index for sales filtered by status (very common)
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);

-- Index for sales filtered by salesperson_id
CREATE INDEX IF NOT EXISTS idx_sales_salesperson_id ON public.sales(salesperson_id);

-- Index for sales filtered by created_at (date range queries)
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);

-- Composite index for sales by salesperson and status (common combo)
CREATE INDEX IF NOT EXISTS idx_sales_salesperson_status ON public.sales(salesperson_id, status);

-- Composite index for sales by status and created_at (for period queries)
CREATE INDEX IF NOT EXISTS idx_sales_status_created_at ON public.sales(status, created_at);

-- Index for activities by salesperson_id
CREATE INDEX IF NOT EXISTS idx_activities_salesperson_id ON public.activities(salesperson_id);

-- Index for activities by created_at
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at);

-- Composite index for activities by salesperson and date
CREATE INDEX IF NOT EXISTS idx_activities_salesperson_date ON public.activities(salesperson_id, created_at);

-- Index for tasks by salesperson_id
CREATE INDEX IF NOT EXISTS idx_tasks_salesperson_id ON public.tasks(salesperson_id);

-- Index for tasks by status
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Composite index for tasks by salesperson and type
CREATE INDEX IF NOT EXISTS idx_tasks_salesperson_type ON public.tasks(salesperson_id, task_type);

-- Index for sales_goals by month
CREATE INDEX IF NOT EXISTS idx_sales_goals_month ON public.sales_goals(month);

-- Index for salespeople by role
CREATE INDEX IF NOT EXISTS idx_salespeople_role ON public.salespeople(role);

-- Composite index for salespeople active by role
CREATE INDEX IF NOT EXISTS idx_salespeople_active_role ON public.salespeople(is_active, role);

-- Index for lead_scores by sale_id (already unique but explicit index helps)
CREATE INDEX IF NOT EXISTS idx_lead_scores_sale_id ON public.lead_scores(sale_id);

-- Index for achievements by salesperson_id
CREATE INDEX IF NOT EXISTS idx_achievements_salesperson_id ON public.achievements(salesperson_id);

-- Index for achievements by date
CREATE INDEX IF NOT EXISTS idx_achievements_date ON public.achievements(achievement_date);

-- Index for deal_stage_history by sale_id
CREATE INDEX IF NOT EXISTS idx_deal_stage_history_sale_id ON public.deal_stage_history(sale_id);

-- Index for prospect_cadences by status
CREATE INDEX IF NOT EXISTS idx_prospect_cadences_status ON public.prospect_cadences(status);

-- Index for cadence_tasks by status and completed_at
CREATE INDEX IF NOT EXISTS idx_cadence_tasks_status ON public.cadence_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cadence_tasks_completed_at ON public.cadence_tasks(completed_at);
