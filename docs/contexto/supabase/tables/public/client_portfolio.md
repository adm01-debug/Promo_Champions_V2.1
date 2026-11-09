# public.client_portfolio

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.engagement_score_leaderboard |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `client_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `status` | `text` | não | `'inactive'::text` |  |  |
| 5 | `last_purchase_date` | `date` | sim |  |  |  |
| 6 | `assigned_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `assigned_by` | `uuid` | sim |  |  |  |
| 8 | `source` | `text` | sim | `'database'::text` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `is_active` | `boolean` | sim | `true` |  |  |
| 12 | `lead_source` | `text` | sim |  |  |  |
| 13 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 14 | `deleted_by` | `uuid` | sim |  |  |  |
| 15 | `delete_reason` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| client_portfolio_assigned_by_fkey | FOREIGN KEY | `FOREIGN KEY (assigned_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| client_portfolio_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| client_portfolio_client_id_salesperson_id_key | UNIQUE | `UNIQUE (client_id, salesperson_id)` |  |  | sim |
| client_portfolio_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| client_portfolio_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| client_portfolio_status_check | CHECK | `CHECK (status = ANY (ARRAY['active'::text, 'nurturing'::text, 'at_risk'::text, 'inactive'::text, 'churned'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| client_portfolio_client_id_salesperson_id_key | btree | client_id, salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX client_portfolio_client_id_salesperson_id_key ON public.client_portfolio USING btree (client_id, salesperson_id)` |
| client_portfolio_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX client_portfolio_pkey ON public.client_portfolio USING btree (id)` |
| idx_client_portfolio_assigned_by | btree | assigned_by | não | sim |  | `CREATE INDEX idx_client_portfolio_assigned_by ON public.client_portfolio USING btree (assigned_by)` |
| idx_client_portfolio_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_client_portfolio_client_id ON public.client_portfolio USING btree (client_id)` |
| idx_client_portfolio_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_client_portfolio_deleted_at ON public.client_portfolio USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_client_portfolio_last_purchase | btree | last_purchase_date | não | sim |  | `CREATE INDEX idx_client_portfolio_last_purchase ON public.client_portfolio USING btree (last_purchase_date)` |
| idx_client_portfolio_salesperson_status | btree | salesperson_id, status | não | sim |  | `CREATE INDEX idx_client_portfolio_salesperson_status ON public.client_portfolio USING btree (salesperson_id, status)` |
| idx_client_portfolio_status | btree | status | não | sim |  | `CREATE INDEX idx_client_portfolio_status ON public.client_portfolio USING btree (status)` |


## Policies (RLS)

### `Users can insert own client_portfolio`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own client_portfolio`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own client_portfolio`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `admin_delete_client_portfolio`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| audit_business_changes | AFTER | DELETE OR UPDATE | ROW | enabled | public.audit_log_row_change |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_client_portfolio_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
