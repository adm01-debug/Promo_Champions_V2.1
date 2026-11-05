# public.clients

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 7 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.client_purchase_seasonality, public.clients_active, public.engagement_score_leaderboard, public.v_active_clients, public.v_deleted_clients |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `email` | `text` | sim |  |  |  |
| 4 | `phone` | `text` | sim |  |  |  |
| 5 | `company` | `text` | sim |  |  |  |
| 6 | `total_value` | `numeric` | não | `0` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 10 | `deleted_by` | `uuid` | sim |  |  | Usuário que deletou |
| 11 | `delete_reason` | `text` | sim |  |  | Motivo do delete |
| 12 | `lat` | `double precision` | sim |  |  |  |
| 13 | `lng` | `double precision` | sim |  |  |  |
| 14 | `user_id` | `uuid` | sim |  |  |  |
| 15 | `last_interaction_at` | `timestamp with time zone` | sim |  |  |  |
| 16 | `lead_source` | `text` | sim |  |  |  |
| 17 | `email_verified` | `boolean` | sim | `false` |  |  |
| 18 | `phone_verified` | `boolean` | sim | `false` |  |  |
| 19 | `last_enrichment_id` | `uuid` | sim |  |  |  |
| 20 | `is_activated` | `boolean` | sim | `false` |  |  |
| 21 | `activated_at` | `timestamp with time zone` | sim |  |  |  |
| 22 | `ramo_atividade` | `text` | sim |  |  | Setor de atuação do cliente (Tecnologia, Indústria, Varejo, etc) |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| clients_deleted_by_fkey | FOREIGN KEY | `FOREIGN KEY (deleted_by) REFERENCES auth.users(id)` | NO ACTION | NO ACTION | sim |
| clients_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| clients_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.activities | activities_client_id_fkey | client_id | SET NULL |
| public.agenda_events | agenda_events_client_id_fkey | client_id | SET NULL |
| public.call_recordings | call_recordings_client_id_fkey | client_id | SET NULL |
| public.client_interactions | client_interactions_client_id_fkey | client_id | CASCADE |
| public.client_portfolio | client_portfolio_client_id_fkey | client_id | CASCADE |
| public.client_renewals | client_renewals_client_id_fkey | client_id | CASCADE |
| public.consent_records | consent_records_subject_client_id_fkey | subject_client_id | SET NULL |
| public.cs_tickets | cs_tickets_client_id_fkey | client_id | CASCADE |
| public.data_subject_requests | data_subject_requests_subject_client_id_fkey | subject_client_id | SET NULL |
| public.icp_data | icp_data_client_id_fkey | client_id | CASCADE |
| public.lead_detailed_logs | lead_detailed_logs_client_id_fkey | client_id | CASCADE |
| public.lead_routing_log | lead_routing_log_client_id_fkey | client_id | SET NULL |
| public.orders | orders_client_id_fkey | client_id | SET NULL |
| public.product_usage | product_usage_client_id_fkey | client_id | CASCADE |
| public.quotes | quotes_client_id_fkey | client_id | SET NULL |
| public.sales | sales_client_id_fkey | client_id | SET NULL |
| public.tasks | tasks_client_id_fkey | client_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| clients_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id)` |
| idx_clients_active | btree | id | não | sim | `(deleted_at IS NULL)` | `CREATE INDEX idx_clients_active ON public.clients USING btree (id) WHERE (deleted_at IS NULL)` |
| idx_clients_company | gin |  | não | sim |  | `CREATE INDEX idx_clients_company ON public.clients USING gin (to_tsvector('portuguese'::regconfig, company))` |
| idx_clients_created | btree | created_at | não | sim |  | `CREATE INDEX idx_clients_created ON public.clients USING btree (created_at DESC)` |
| idx_clients_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_clients_created_at ON public.clients USING btree (created_at DESC)` |
| idx_clients_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_clients_deleted ON public.clients USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_clients_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_clients_deleted_at ON public.clients USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_clients_deleted_by | btree | deleted_by | não | sim |  | `CREATE INDEX idx_clients_deleted_by ON public.clients USING btree (deleted_by)` |
| idx_clients_email | btree | email | não | sim |  | `CREATE INDEX idx_clients_email ON public.clients USING btree (email)` |
| idx_clients_email_trgm | gin | email | não | sim |  | `CREATE INDEX idx_clients_email_trgm ON public.clients USING gin (email gin_trgm_ops)` |
| idx_clients_is_activated | btree | is_activated | não | sim |  | `CREATE INDEX idx_clients_is_activated ON public.clients USING btree (is_activated)` |
| idx_clients_lat_lng | btree | lat, lng | não | sim | `((lat IS NOT NULL) AND (lng IS NOT NULL))` | `CREATE INDEX idx_clients_lat_lng ON public.clients USING btree (lat, lng) WHERE ((lat IS NOT NULL) AND (lng IS NOT NULL))` |
| idx_clients_name_search | gin |  | não | sim |  | `CREATE INDEX idx_clients_name_search ON public.clients USING gin (to_tsvector('portuguese'::regconfig, name))` |
| idx_clients_name_trgm | gin | name | não | sim |  | `CREATE INDEX idx_clients_name_trgm ON public.clients USING gin (name gin_trgm_ops)` |
| idx_clients_phone | btree | phone | não | sim |  | `CREATE INDEX idx_clients_phone ON public.clients USING btree (phone)` |
| idx_clients_total_value | btree | total_value | não | sim |  | `CREATE INDEX idx_clients_total_value ON public.clients USING btree (total_value DESC)` |
| idx_clients_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_clients_user_id ON public.clients USING btree (user_id)` |
| ux_clients_email | btree |  | sim | sim | `((email IS NOT NULL) AND (deleted_at IS NULL))` | `CREATE UNIQUE INDEX ux_clients_email ON public.clients USING btree (lower(email)) WHERE ((email IS NOT NULL) AND (deleted_at IS NULL))` |


## Policies (RLS)

### `Admins and managers can insert clients`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update clients`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can insert own clients`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users can read assigned clients`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own clients`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users can view own clients`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `admin_delete_clients`

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
| log_clients_access | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.log_data_access |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| tr_auto_add_client_portfolio | AFTER | INSERT | ROW | enabled | public.auto_add_client_to_portfolio |
| update_clients_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
