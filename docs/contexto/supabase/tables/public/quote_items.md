# public.quote_items

> Itens de produto e valores que compõem um orçamento.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do item do orçamento. |
| 2 | `quote_id` | `uuid` | não |  |  | Orçamento ao qual o item pertence. |
| 3 | `product_id` | `uuid` | sim |  |  | Produto do catálogo associado ao item, quando identificado. |
| 4 | `product_name` | `text` | não |  |  | Nome do produto registrado no item do orçamento. |
| 5 | `quantity` | `integer` | não | `1` |  | Quantidade de unidades incluídas no item. |
| 6 | `unit_price` | `numeric(15,2)` | não |  |  | Preço unitário do item, em BRL. |
| 7 | `discount_amount` | `numeric(15,2)` | sim | `0` |  | Valor de desconto aplicado ao item, em BRL. |
| 8 | `total_price` | `numeric(15,2)` | não |  |  | Valor total do item, em BRL. |
| 9 | `is_recurring` | `boolean` | sim | `false` |  | Indica se o item representa uma cobrança recorrente. |
| 10 | `billing_period` | `text` | sim |  |  | Período de cobrança do item recorrente, quando informado. |
| 11 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação do item. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quote_items_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| quote_items_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| quote_items_quote_id_fkey | FOREIGN KEY | `FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_quote_items_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_quote_items_product_id ON public.quote_items USING btree (product_id)` |
| idx_quote_items_quote_id | btree | quote_id | não | sim |  | `CREATE INDEX idx_quote_items_quote_id ON public.quote_items USING btree (quote_id)` |
| quote_items_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quote_items_pkey ON public.quote_items USING btree (id)` |


## Policies (RLS)

### `Admins delete quote items`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Closers insert own quote items`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM quotes q   WHERE ((q.id = quote_items.quote_id) AND (is_admin_or_manager(auth.uid()) OR (q.created_by = get_current_salesperson_id())))))` |

### `Closers update own quote items`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM quotes q   WHERE ((q.id = quote_items.quote_id) AND (is_admin_or_manager(auth.uid()) OR (q.created_by = get_current_salesperson_id())))))` |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM quotes q   WHERE ((q.id = quote_items.quote_id) AND (is_admin_or_manager(auth.uid()) OR (q.created_by = get_current_salesperson_id())))))` |

### `Quote items are viewable by authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
