# public.webhook_dispatch_rate

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 0 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `subscription_id` | `uuid` | não |  |  |  |
| 3 | `dispatched_at` | `timestamp with time zone` | não | `now()` |  |  |
| 4 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 5 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| webhook_dispatch_rate_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| webhook_dispatch_rate_subscription_id_fkey | FOREIGN KEY | `FOREIGN KEY (subscription_id) REFERENCES winloss_webhook_subscriptions(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_webhook_dispatch_rate_sub_ts | btree | subscription_id, dispatched_at | não | sim |  | `CREATE INDEX idx_webhook_dispatch_rate_sub_ts ON public.webhook_dispatch_rate USING btree (subscription_id, dispatched_at DESC)` |
| webhook_dispatch_rate_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webhook_dispatch_rate_pkey ON public.webhook_dispatch_rate USING btree (id)` |


## Policies (RLS)

> ⚠️ RLS habilitado **sem policies**: nenhum acesso via API (anon/authenticated).



## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at_webhook_dispatch_rate | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
