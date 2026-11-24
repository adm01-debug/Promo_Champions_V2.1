# public.dialer_queues

> Tabela public.dialer_queues. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, name text NOT NULL, filter jsonb NOT NULL DEFAULT '{}'::jsonb, priority_strategy text NOT NULL DEFAULT 'hybrid'::text, is_active boolean NOT NULL DEFAULT true, last_built_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.dialer_queues. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.dialer_queues. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `name` | `text` | não |  |  | Coluna name da tabela public.dialer_queues. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `filter` | `jsonb` | não | `'{}'::jsonb` |  | Coluna filter da tabela public.dialer_queues. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 5 | `priority_strategy` | `text` | não | `'hybrid'::text` |  | Coluna priority_strategy da tabela public.dialer_queues. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'hybrid'::text. Validação CHECK: CHECK (priority_strategy = ANY (ARRAY['score'::text, 'recency'::text, 'send_time'::text, 'hybrid'::text])). |
| 6 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.dialer_queues. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 7 | `last_built_at` | `timestamp with time zone` | sim |  |  | Coluna last_built_at da tabela public.dialer_queues. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.dialer_queues. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.dialer_queues. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
