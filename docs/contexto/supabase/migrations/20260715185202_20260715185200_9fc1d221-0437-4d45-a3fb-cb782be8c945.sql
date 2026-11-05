-- Onda E — Performance indexes to eliminate top slow queries

-- 1. tasks: consultas por janela de tempo em created_at (ActivityChart, dashboards)
CREATE INDEX IF NOT EXISTS idx_tasks_created_at
  ON public.tasks (created_at DESC);

-- 2. sales: padrão comum é WHERE status IN (...) ORDER BY created_at DESC.
-- O índice existente idx_sales_status_created_at é ASC; adicionar DESC alinha
-- com o ORDER BY e evita sort adicional.
CREATE INDEX IF NOT EXISTS idx_sales_status_created_at_desc
  ON public.sales (status, created_at DESC);

-- 3. tasks: consultas por salesperson + janela de tempo
CREATE INDEX IF NOT EXISTS idx_tasks_salesperson_created_at
  ON public.tasks (salesperson_id, created_at DESC);
