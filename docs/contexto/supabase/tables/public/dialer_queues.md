# public.dialer_queues

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
| 2 | `owner_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `filter` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 5 | `priority_strategy` | `text` | não | `'hybrid'::text` |  |  |
| 6 | `is_active` | `boolean` | não | `true` |  |  |
| 7 | `last_built_at` | `timestamp with time zone` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| dialer_queues_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| dialer_queues_priority_strategy_check | CHECK | `CHECK (priority_strategy = ANY (ARRAY['score'::text, 'recency'::text, 'send_time'::text, 'hybrid'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.dialer_queue_items | dialer_queue_items_queue_id_fkey | queue_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| dialer_queues_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX dialer_queues_pkey ON public.dialer_queues USING btree (id)` |


## Policies (RLS)

### `Owners manage own queues`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |

### `Owners view own queues`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_dialer_queues_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
