# public.data_access_log

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  |  |
| 2 | `user_id` | `uuid` | sim |  |  |  |
| 3 | `table_name` | `text` | não |  |  |  |
| 4 | `record_id` | `uuid` | sim |  |  |  |
| 5 | `action` | `text` | não |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| data_access_log_action_check | CHECK | `CHECK (action = ANY (ARRAY['SELECT'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))` |  |  | sim |
| data_access_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| data_access_log_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| data_access_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX data_access_log_pkey ON public.data_access_log USING btree (id)` |
| idx_data_access_log_created | btree | created_at | não | sim |  | `CREATE INDEX idx_data_access_log_created ON public.data_access_log USING btree (created_at DESC)` |
| idx_data_access_table | btree | table_name, created_at | não | sim |  | `CREATE INDEX idx_data_access_table ON public.data_access_log USING btree (table_name, created_at)` |
| idx_data_access_user | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_data_access_user ON public.data_access_log USING btree (user_id, created_at)` |


## Policies (RLS)

### `Users can view own data access`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
