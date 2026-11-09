# public.webhooks

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `url` | `text` | não |  |  |  |
| 4 | `secret` | `text` | não |  |  |  |
| 5 | `events` | `text[]` | não | `'{}'::text[]` |  |  |
| 6 | `enabled` | `boolean` | sim | `true` |  |  |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 9 | `headers` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 10 | `is_active` | `boolean` | não | `true` |  |  |
| 11 | `failure_count` | `integer` | não | `0` |  |  |
| 12 | `last_triggered_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `last_success_at` | `timestamp with time zone` | sim |  |  |  |
| 14 | `last_failure_at` | `timestamp with time zone` | sim |  |  |  |
| 15 | `created_by` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| webhooks_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| webhooks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.webhook_deliveries | webhook_deliveries_webhook_id_fkey | webhook_id | CASCADE |
| public.webhook_events | webhook_events_webhook_id_fkey | webhook_id | CASCADE |
| public.webhook_logs | webhook_logs_webhook_id_fkey | webhook_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_webhooks_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_webhooks_created_by ON public.webhooks USING btree (created_by)` |
| idx_webhooks_enabled | btree | enabled | não | sim |  | `CREATE INDEX idx_webhooks_enabled ON public.webhooks USING btree (enabled)` |
| webhooks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webhooks_pkey ON public.webhooks USING btree (id)` |


## Policies (RLS)

### `Admins and managers can manage webhooks`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can view webhooks`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can manage webhooks`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM auth.users   WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'admin'::text))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_webhooks_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
