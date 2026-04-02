CREATE INDEX IF NOT EXISTS idx_activities_salesperson_created 
  ON public.activities (salesperson_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_salesperson_status 
  ON public.sales (salesperson_id, status);

CREATE INDEX IF NOT EXISTS idx_tasks_salesperson_status 
  ON public.tasks (salesperson_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_client_portfolio_salesperson_status 
  ON public.client_portfolio (salesperson_id, status);

CREATE INDEX IF NOT EXISTS idx_deal_stage_history_sale 
  ON public.deal_stage_history (sale_id, entered_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date_active 
  ON public.daily_challenges (challenge_date, is_active);

CREATE INDEX IF NOT EXISTS idx_victory_feed_created 
  ON public.victory_feed (created_at DESC);