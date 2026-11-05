# public.follow_up_audit_logs

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.follow_up_audit_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | sim |  |  |  |
| 3 | `user_id` | `uuid` | sim |  |  |  |
| 4 | `action_type` | `text` | não |  |  |  |
| 5 | `details` | `jsonb` | sim |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 7 | `status` | `text` | sim | `'pending'::text` |  |  |
| 8 | `retry_count` | `integer` | sim | `0` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| follow_up_audit_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| follow_up_audit_logs_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| follow_up_audit_logs_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.follow_up_notifications | follow_up_notifications_audit_log_id_fkey | audit_log_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| follow_up_audit_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX follow_up_audit_logs_pkey ON public.follow_up_audit_logs USING btree (id)` |
| idx_follow_up_audit_logs_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_follow_up_audit_logs_sale_id ON public.follow_up_audit_logs USING btree (sale_id)` |
| idx_follow_up_audit_logs_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_follow_up_audit_logs_user_id ON public.follow_up_audit_logs USING btree (user_id)` |


## Policies (RLS)

### `Authenticated users can insert audit logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() IS NOT NULL)` |

### `Users can read audit logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
