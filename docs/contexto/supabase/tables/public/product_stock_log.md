# public.product_stock_log

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
| 2 | `product_id` | `uuid` | sim |  |  |  |
| 3 | `change_amount` | `integer` | não |  |  |  |
| 4 | `reason` | `text` | sim |  |  |  |
| 5 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| product_stock_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| product_stock_log_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_product_stock_log_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_product_stock_log_product_id ON public.product_stock_log USING btree (product_id)` |
| product_stock_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX product_stock_log_pkey ON public.product_stock_log USING btree (id)` |


## Policies (RLS)

### `Allow authenticated users to read stock logs`

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
