# public.activities

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.activities_active, public.race_leaderboard_view, public.v_active_activities |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `salesperson_id` | `uuid` | sim |  |  |  |
| 4 | `activity_type` | `activity_type` | não |  |  |  |
| 5 | `outcome` | `activity_outcome` | não |  |  |  |
| 6 | `notes` | `text` | sim |  |  |  |
| 7 | `duration_minutes` | `integer` | sim |  |  |  |
| 8 | `contact_name` | `text` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `client_id` | `uuid` | sim |  |  |  |
| 11 | `lead_status` | `text` | sim | `'prospect'::text` |  |  |
| 12 | `mql_qualified_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `qualification_score` | `integer` | sim | `0` |  |  |
| 14 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 15 | `deleted_by` | `uuid` | sim |  |  |  |
| 16 | `delete_reason` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| activities_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| activities_deleted_by_fkey | FOREIGN KEY | `FOREIGN KEY (deleted_by) REFERENCES auth.users(id)` | NO ACTION | NO ACTION | sim |
| activities_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| activities_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| activities_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.activity_audit_logs | activity_audit_logs_activity_id_fkey | activity_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| activities_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX activities_pkey ON public.activities USING btree (id)` |
| idx_activities_active | btree | id | não | sim | `(deleted_at IS NULL)` | `CREATE INDEX idx_activities_active ON public.activities USING btree (id) WHERE (deleted_at IS NULL)` |
| idx_activities_client_date | btree | client_id, created_at | não | sim |  | `CREATE INDEX idx_activities_client_date ON public.activities USING btree (client_id, created_at DESC)` |
| idx_activities_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_activities_client_id ON public.activities USING btree (client_id)` |
| idx_activities_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_activities_created_at ON public.activities USING btree (created_at DESC)` |
| idx_activities_created_brin | brin | created_at | não | sim |  | `CREATE INDEX idx_activities_created_brin ON public.activities USING brin (created_at)` |
| idx_activities_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_activities_deleted ON public.activities USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_activities_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_activities_deleted_at ON public.activities USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_activities_deleted_by_fk | btree | deleted_by | não | sim |  | `CREATE INDEX idx_activities_deleted_by_fk ON public.activities USING btree (deleted_by)` |
| idx_activities_outcome | btree | outcome | não | sim |  | `CREATE INDEX idx_activities_outcome ON public.activities USING btree (outcome)` |
| idx_activities_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_activities_sale_id ON public.activities USING btree (sale_id)` |
| idx_activities_salesperson_created | btree | salesperson_id, created_at | não | sim |  | `CREATE INDEX idx_activities_salesperson_created ON public.activities USING btree (salesperson_id, created_at DESC)` |
| idx_activities_salesperson_type | btree | salesperson_id, activity_type | não | sim |  | `CREATE INDEX idx_activities_salesperson_type ON public.activities USING btree (salesperson_id, activity_type)` |
| idx_activities_type | btree | activity_type | não | sim |  | `CREATE INDEX idx_activities_type ON public.activities USING btree (activity_type)` |


## Policies (RLS)

### `Users can insert own activities`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own activities or admins all`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own activities`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `admin_delete_activities`

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
| audit_activities | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.audit_trigger_func |
| audit_activities_trigger | AFTER | DELETE OR UPDATE | ROW | enabled | public.audit_activity_changes |
| audit_soft_delete_activities | AFTER | UPDATE | ROW | enabled | public.log_soft_delete |
| tr_maintain_streaks | AFTER | INSERT | ROW | enabled | public.maintain_sales_streaks |
| tr_performance_update_activities | AFTER | INSERT OR UPDATE | ROW | enabled | private.handle_performance_update |
| tr_sync_battle_score_activities | AFTER | INSERT OR UPDATE | ROW | enabled | public.sync_battle_score |
| tr_sync_bets_activities | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.sync_performance_bets |
| tr_update_bets_on_activity | AFTER | INSERT | ROW | enabled | public.process_performance_bet_event |
| trg_activities_auto_pause | AFTER | INSERT | ROW | enabled | private.trg_activities_auto_pause_sequences |
| update_bets_on_activity | AFTER | INSERT OR UPDATE | ROW | enabled | private.trigger_update_performance_bets |


## Grants

_nenhum_
