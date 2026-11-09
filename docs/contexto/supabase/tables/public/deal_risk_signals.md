# public.deal_risk_signals

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `signal_type` | `text` | não |  |  |  |
| 4 | `severity` | `text` | não |  |  |  |
| 5 | `description` | `text` | não |  |  |  |
| 6 | `detected_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `resolved_at` | `timestamp with time zone` | sim |  |  |  |
| 8 | `resolved_by` | `uuid` | sim |  |  |  |
| 9 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_risk_signals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_risk_signals_resolved_by_fkey | FOREIGN KEY | `FOREIGN KEY (resolved_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| deal_risk_signals_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_risk_signals_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| deal_risk_signals_signal_type_check | CHECK | `CHECK (signal_type = ANY (ARRAY['stagnation'::text, 'no_contact'::text, 'engagement_drop'::text, 'price_resistance'::text, 'competitor_mentioned'::text, 'single_threaded'::text, 'overdue_followup'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_risk_signals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_risk_signals_pkey ON public.deal_risk_signals USING btree (id)` |
| idx_deal_risk_signals_resolved_by | btree | resolved_by | não | sim |  | `CREATE INDEX idx_deal_risk_signals_resolved_by ON public.deal_risk_signals USING btree (resolved_by)` |
| idx_risk_signals_sale | btree | sale_id, detected_at | não | sim |  | `CREATE INDEX idx_risk_signals_sale ON public.deal_risk_signals USING btree (sale_id, detected_at DESC)` |
| idx_risk_signals_unresolved | btree | severity, detected_at | não | sim | `(resolved_at IS NULL)` | `CREATE INDEX idx_risk_signals_unresolved ON public.deal_risk_signals USING btree (severity, detected_at DESC) WHERE (resolved_at IS NULL)` |


## Policies (RLS)

### `Authenticated insert signals`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() IS NOT NULL)` |

### `Owners resolve own signals`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_risk_signals.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |

### `View signals via sale access`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = deal_risk_signals.sale_id) AND ((s.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
