# public.email_logs

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
| 2 | `function_name` | `text` | não |  |  |  |
| 3 | `recipient_email` | `text` | não |  |  |  |
| 4 | `subject` | `text` | sim |  |  |  |
| 5 | `status` | `text` | não | `'sent'::text` |  |  |
| 6 | `error_message` | `text` | sim |  |  |  |
| 7 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| email_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| email_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX email_logs_pkey ON public.email_logs USING btree (id)` |
| idx_email_logs_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_email_logs_created_at ON public.email_logs USING btree (created_at DESC)` |
| idx_email_logs_function_name | btree | function_name | não | sim |  | `CREATE INDEX idx_email_logs_function_name ON public.email_logs USING btree (function_name)` |
| idx_email_logs_status | btree | status | não | sim |  | `CREATE INDEX idx_email_logs_status ON public.email_logs USING btree (status)` |


## Policies (RLS)

### `Admins and managers can view email_logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
