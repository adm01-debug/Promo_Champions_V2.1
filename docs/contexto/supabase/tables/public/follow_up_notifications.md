# public.follow_up_notifications

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `user_id` | `uuid` | sim |  |  |  |
| 3 | `sale_id` | `uuid` | sim |  |  |  |
| 4 | `audit_log_id` | `uuid` | sim |  |  |  |
| 5 | `type` | `text` | não |  |  |  |
| 6 | `status` | `text` | sim | `'unread'::text` |  |  |
| 7 | `message` | `text` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| follow_up_notifications_audit_log_id_fkey | FOREIGN KEY | `FOREIGN KEY (audit_log_id) REFERENCES follow_up_audit_logs(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| follow_up_notifications_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| follow_up_notifications_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| follow_up_notifications_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| follow_up_notifications_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX follow_up_notifications_pkey ON public.follow_up_notifications USING btree (id)` |
| idx_follow_up_notifications_audit_log_id | btree | audit_log_id | não | sim |  | `CREATE INDEX idx_follow_up_notifications_audit_log_id ON public.follow_up_notifications USING btree (audit_log_id)` |
| idx_follow_up_notifications_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_follow_up_notifications_sale_id ON public.follow_up_notifications USING btree (sale_id)` |
| idx_follow_up_notifications_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_follow_up_notifications_user_id ON public.follow_up_notifications USING btree (user_id)` |


## Policies (RLS)

### `Users can manage their own notifications`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(user_id = auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
