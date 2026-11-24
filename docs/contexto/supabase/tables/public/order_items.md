# public.order_items

> Tabela public.order_items. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), order_id uuid NOT NULL, product_name text NOT NULL, quantity integer NOT NULL DEFAULT 1, unit_price numeric(12,2) NOT NULL DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: order_id → public.orders(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.order_items. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `order_id` | `uuid` | não |  |  | Coluna order_id da tabela public.order_items. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.orders(id). |
| 3 | `product_name` | `text` | não |  |  | Coluna product_name da tabela public.order_items. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `quantity` | `integer` | não | `1` |  | Coluna quantity da tabela public.order_items. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 5 | `unit_price` | `numeric(12,2)` | não | `0` |  | Coluna unit_price da tabela public.order_items. Tipo PostgreSQL: numeric(12,2). Não aceita NULL. Valor padrão: 0. |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.order_items. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| order_items_order_id_fkey | FOREIGN KEY | `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| order_items_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_order_items_order | btree | order_id | não | sim |  | `CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id)` |
| order_items_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id)` |


## Policies (RLS)

### `Admins and managers manage order_items`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Users insert own order items`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM orders o   WHERE ((o.id = order_items.order_id) AND (o.user_id = auth.uid()))))` |

### `Users view own order items`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM orders o   WHERE ((o.id = order_items.order_id) AND ((o.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_supply_enqueue_from_order_item | AFTER | INSERT | ROW | enabled | public.tg_supply_enqueue_from_order_item |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
