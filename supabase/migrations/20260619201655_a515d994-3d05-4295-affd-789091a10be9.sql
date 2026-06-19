-- Drop true duplicate / redundant indexes identified via pg_index analysis.
-- Each pair shares the exact same (table, columns, predicate); we keep the better-named or partial variant.
DROP INDEX IF EXISTS public.idx_access_denied_logs_created_at;   -- dup of idx_access_denied_created_at
DROP INDEX IF EXISTS public.idx_achievements_salesperson_id;     -- dup of idx_achievements_salesperson
DROP INDEX IF EXISTS public.idx_activities_salesperson_date;     -- dup of idx_activities_salesperson_created (DESC variant kept)
DROP INDEX IF EXISTS public.idx_ccs_sp_calc;                     -- dup of idx_ccs_salesperson (DESC variant kept)
DROP INDEX IF EXISTS public.idx_security_alerts_created_at;      -- dup of idx_security_alert_history_created
DROP INDEX IF EXISTS public.idx_wli_created_at;                  -- dup of idx_wli_created
DROP INDEX IF EXISTS public.idx_clients_coords;                  -- superseded by partial idx_clients_lat_lng
DROP INDEX IF EXISTS public.idx_products_name;                   -- superseded by GIN trigram idx_products_name_trgm