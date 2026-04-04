
-- performance_bets (correct column)
CREATE INDEX IF NOT EXISTS idx_performance_bets_salesperson ON public.performance_bets (salesperson_id);
CREATE INDEX IF NOT EXISTS idx_performance_bets_status ON public.performance_bets (status);

-- deal_outcomes
CREATE INDEX IF NOT EXISTS idx_deal_outcomes_sale ON public.deal_outcomes (sale_id);
CREATE INDEX IF NOT EXISTS idx_deal_outcomes_salesperson ON public.deal_outcomes (salesperson_id);
CREATE INDEX IF NOT EXISTS idx_deal_outcomes_created ON public.deal_outcomes (created_at DESC);

-- active_power_ups
CREATE INDEX IF NOT EXISTS idx_active_power_ups_salesperson ON public.active_power_ups (salesperson_id);
CREATE INDEX IF NOT EXISTS idx_active_power_ups_active ON public.active_power_ups (is_active, expires_at);

-- notification_preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences (user_id);

-- weekly_challenges
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_active ON public.weekly_challenges (is_active, start_date, end_date);

-- products
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);

-- cadence_steps
CREATE INDEX IF NOT EXISTS idx_cadence_steps_cadence ON public.cadence_steps (cadence_id, step_order);

-- password_reset_requests
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status ON public.password_reset_requests (status, created_at DESC);

-- security_alert_history
CREATE INDEX IF NOT EXISTS idx_security_alert_history_created ON public.security_alert_history (created_at DESC);
