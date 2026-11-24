# public.supply_outbox

> Tabela public.supply_outbox. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), order_id uuid NOT NULL, order_item_id uuid NOT NULL, event text NOT NULL DEFAULT 'pedido.criado'::text, payload jsonb NOT NULL, status text NOT NULL DEFAULT 'pending'::text, attempts integer NOT NULL DEFAULT 0, last_error text NULLABLE, next_attempt_at timestamp with time zone NOT NULL DEFAULT now(), delivered_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: order_id → public.orders(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.supply_outbox. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `order_id` | `uuid` | não |  |  | Coluna order_id da tabela public.supply_outbox. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.orders(id). |
| 3 | `order_item_id` | `uuid` | não |  |  | Coluna order_item_id da tabela public.supply_outbox. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `event` | `text` | não | `'pedido.criado'::text` |  | Coluna event da tabela public.supply_outbox. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pedido.criado'::text. |
| 5 | `payload` | `jsonb` | não |  |  | Coluna payload da tabela public.supply_outbox. Tipo PostgreSQL: jsonb. Não aceita NULL. |
| 6 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.supply_outbox. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'delivered'::text, 'dead'::text])). |
| 7 | `attempts` | `integer` | não | `0` |  | Coluna attempts da tabela public.supply_outbox. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `last_error` | `text` | sim |  |  | Coluna last_error da tabela public.supply_outbox. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `next_attempt_at` | `timestamp with time zone` | não | `now()` |  | Coluna next_attempt_at da tabela public.supply_outbox. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `delivered_at` | `timestamp with time zone` | sim |  |  | Coluna delivered_at da tabela public.supply_outbox. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.supply_outbox. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.supply_outbox. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| supply_outbox_item_event_key | UNIQUE | `UNIQUE (order_item_id, event)` |  |  | sim |
| supply_outbox_order_id_fkey | FOREIGN KEY | `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| supply_outbox_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| supply_outbox_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'delivered'::text, 'dead'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_supply_outbox_due | btree | next_attempt_at | não | sim | `(status = 'pending'::text)` | `CREATE INDEX idx_supply_outbox_due ON public.supply_outbox USING btree (next_attempt_at) WHERE (status = 'pending'::text)` |
| idx_supply_outbox_order | btree | order_id | não | sim |  | `CREATE INDEX idx_supply_outbox_order ON public.supply_outbox USING btree (order_id)` |
| supply_outbox_item_event_key | btree | order_item_id, event | sim | sim |  | `CREATE UNIQUE INDEX supply_outbox_item_event_key ON public.supply_outbox USING btree (order_item_id, event)` |
| supply_outbox_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX supply_outbox_pkey ON public.supply_outbox USING btree (id)` |


## Policies (RLS)

### `supply_outbox_admin_read`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| authenticated | SELECT |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
