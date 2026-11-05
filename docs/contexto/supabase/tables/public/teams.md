# public.teams

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
| usada por views | public.v_active_teams |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `sdr_id` | `uuid` | sim |  |  |  |
| 4 | `is_active` | `boolean` | não | `true` |  |  |
| 5 | `inactivity_days` | `integer` | não | `365` |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `deleted_at` | `timestamp with time zone` | sim |  |  | Soft delete: preenchido marca o registro como excluído sem remoção física. |
| 9 | `deleted_by` | `uuid` | sim |  |  |  |
| 10 | `delete_reason` | `text` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| teams_deleted_by_fkey | FOREIGN KEY | `FOREIGN KEY (deleted_by) REFERENCES auth.users(id)` | NO ACTION | NO ACTION | sim |
| teams_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| teams_sdr_id_fkey | FOREIGN KEY | `FOREIGN KEY (sdr_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.api_tokens | api_tokens_team_id_fkey | team_id | SET NULL |
| public.team_closers | team_closers_team_id_fkey | team_id | CASCADE |
| public.team_custom_fields | team_custom_fields_team_id_fkey | team_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_teams_active | btree | id | não | sim | `(deleted_at IS NULL)` | `CREATE INDEX idx_teams_active ON public.teams USING btree (id) WHERE (deleted_at IS NULL)` |
| idx_teams_deleted | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_teams_deleted ON public.teams USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_teams_deleted_at | btree | deleted_at | não | sim | `(deleted_at IS NOT NULL)` | `CREATE INDEX idx_teams_deleted_at ON public.teams USING btree (deleted_at) WHERE (deleted_at IS NOT NULL)` |
| idx_teams_deleted_by_fk | btree | deleted_by | não | sim |  | `CREATE INDEX idx_teams_deleted_by_fk ON public.teams USING btree (deleted_by)` |
| idx_teams_sdr_id | btree | sdr_id | não | sim |  | `CREATE INDEX idx_teams_sdr_id ON public.teams USING btree (sdr_id)` |
| teams_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id)` |


## Policies (RLS)

### `Admins and managers can insert teams`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update teams`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can read teams`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `admin_delete_teams`

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
| audit_soft_delete_teams | AFTER | UPDATE | ROW | enabled | public.log_soft_delete |
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_teams_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
