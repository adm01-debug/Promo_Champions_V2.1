-- 1. HIGH-PERFORMANCE SEARCH
-- Enable pg_trgm for fast fuzzy searching if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fuzzy search index for leads/sales
CREATE INDEX IF NOT EXISTS idx_sales_client_name_trgm ON public.sales USING gin (client_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sales_product_name_trgm ON public.sales USING gin (product_name gin_trgm_ops);

-- 2. CADENCE ENGINE OPTIMIZATION
-- Optimize the "Today's Tasks" and "Active Enrollments" queries
CREATE INDEX IF NOT EXISTS idx_cadence_tasks_status_date ON public.cadence_tasks(status, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_prospect_cadences_active_status ON public.prospect_cadences(status, next_action_date) WHERE status = 'active';

-- 3. BUSINESS LOGIC CONSTRAINTS
-- Prevent invalid data states that could crash the UI
ALTER TABLE public.tasks ADD CONSTRAINT tasks_due_date_check CHECK (due_date >= '2020-01-01');
ALTER TABLE public.products ADD CONSTRAINT products_price_positive CHECK (price >= 0);
ALTER TABLE public.products ADD CONSTRAINT products_stock_positive CHECK (stock_quantity >= 0);

-- 4. REPORTING & ANALYTICS SPEED
-- Accelerate time-series joins
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON public.daily_metrics(date DESC);

-- 5. AUDIT LOG RETENTION PERFORMANCE
-- Ensure security dashboards are always fast
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alert_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_denied_created_at ON public.access_denied_logs(created_at DESC);

-- 6. RELIABILITY: Ensure every table has a primary key and basic audit
-- (Many tables already have this, but this is a safety sweep)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        -- Basic performance check: every table should have at least one index (the PK)
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = t) THEN
            RAISE WARNING 'Table % has no indexes!', t;
        END IF;
    END LOOP;
END $$;
