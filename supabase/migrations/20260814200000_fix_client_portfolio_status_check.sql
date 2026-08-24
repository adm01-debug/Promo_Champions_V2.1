-- The Kanban de Clientes UI (src/components/clients/ClientKanban.tsx) drags
-- clients between 5 stages: active, nurturing, at_risk, inactive, churned.
-- The check constraint only allowed ('active', 'inactive'), so dragging a
-- card into any of the other 3 columns — or seeding realistic portfolio
-- data — always failed with a check constraint violation.

ALTER TABLE public.client_portfolio DROP CONSTRAINT client_portfolio_status_check;

ALTER TABLE public.client_portfolio
  ADD CONSTRAINT client_portfolio_status_check
  CHECK (status = ANY (ARRAY['active', 'nurturing', 'at_risk', 'inactive', 'churned']));
