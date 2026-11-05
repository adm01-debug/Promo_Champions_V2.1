# public.audit_log

> superseded por public.audit_logs (20261001193100_audit_log_canonical). Mantida só para leitura histórica.

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `table_name` | `text` | não |  |  |  |
| 3 | `record_id` | `uuid` | não |  |  |  |
| 4 | `action` | `text` | não |  |  |  |
| 5 | `old_data` | `jsonb` | sim |  |  |  |
| 6 | `new_data` | `jsonb` | sim |  |  |  |
| 7 | `user_id` | `uuid` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| audit_log_action_check | CHECK | `CHECK (action = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text]))` |  |  | sim |
| audit_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| audit_log_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| audit_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX audit_log_pkey ON public.audit_log USING btree (id)` |
| idx_audit_action | btree | action | não | sim |  | `CREATE INDEX idx_audit_action ON public.audit_log USING btree (action)` |
| idx_audit_created | btree | created_at | não | sim |  | `CREATE INDEX idx_audit_created ON public.audit_log USING btree (created_at DESC)` |
| idx_audit_log_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_audit_log_created_at ON public.audit_log USING btree (created_at DESC)` |
| idx_audit_log_created_brin | brin | created_at | não | sim |  | `CREATE INDEX idx_audit_log_created_brin ON public.audit_log USING brin (created_at)` |
| idx_audit_log_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_audit_log_user_id ON public.audit_log USING btree (user_id)` |
| idx_audit_record | btree | record_id | não | sim |  | `CREATE INDEX idx_audit_record ON public.audit_log USING btree (record_id)` |
| idx_audit_table | btree | table_name, record_id | não | sim |  | `CREATE INDEX idx_audit_table ON public.audit_log USING btree (table_name, record_id)` |
| idx_audit_user | btree | user_id | não | sim |  | `CREATE INDEX idx_audit_user ON public.audit_log USING btree (user_id)` |


## Policies (RLS)

### `Admins can view all audit logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM auth.users   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text))))` |
| WITH CHECK |  |

### `Users can view own audit logs`

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
