# public.webhook_logs

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
| 2 | `webhook_id` | `uuid` | sim |  |  |  |
| 3 | `status` | `text` | não |  |  |  |
| 4 | `request_body` | `jsonb` | sim |  |  |  |
| 5 | `response_status` | `integer` | sim |  |  |  |
| 6 | `response_body` | `jsonb` | sim |  |  |  |
| 7 | `error_message` | `text` | sim |  |  |  |
| 8 | `attempt` | `integer` | sim | `1` |  |  |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| webhook_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| webhook_logs_webhook_id_fkey | FOREIGN KEY | `FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_webhook_logs_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs USING btree (created_at DESC)` |
| idx_webhook_logs_status | btree | status | não | sim |  | `CREATE INDEX idx_webhook_logs_status ON public.webhook_logs USING btree (status)` |
| idx_webhook_logs_webhook_id | btree | webhook_id | não | sim |  | `CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs USING btree (webhook_id)` |
| webhook_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webhook_logs_pkey ON public.webhook_logs USING btree (id)` |


## Policies (RLS)

### `Admins can view webhook logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM auth.users   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
