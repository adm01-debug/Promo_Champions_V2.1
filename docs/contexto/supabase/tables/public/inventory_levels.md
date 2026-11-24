# public.inventory_levels

> Nível atual de estoque e parâmetros de reposição por produto.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do registro de estoque. |
| 2 | `product_id` | `uuid` | sim |  |  | Produto ao qual os níveis de estoque se referem. |
| 3 | `current_stock` | `integer` | não | `0` |  | Quantidade atualmente disponível em estoque. |
| 4 | `min_stock_level` | `integer` | não | `10` |  | Nível mínimo de estoque configurado. |
| 5 | `max_stock_level` | `integer` | não | `100` |  | Nível máximo de estoque configurado. |
| 6 | `reorder_point` | `integer` | não | `20` |  | Quantidade de estoque que aciona a necessidade de reposição. |
| 7 | `lead_time_days` | `integer` | sim | `7` |  | Prazo de reposição estimado em dias, quando informado. |
| 8 | `last_restock_date` | `timestamp with time zone` | sim |  |  | Data e hora da reposição mais recente. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do registro. |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização do registro. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| inventory_levels_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| inventory_levels_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| inventory_levels_product_id_key | UNIQUE | `UNIQUE (product_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_inventory_levels_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_inventory_levels_product_id ON public.inventory_levels USING btree (product_id)` |
| inventory_levels_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX inventory_levels_pkey ON public.inventory_levels USING btree (id)` |
| inventory_levels_product_id_key | btree | product_id | sim | sim |  | `CREATE UNIQUE INDEX inventory_levels_product_id_key ON public.inventory_levels USING btree (product_id)` |


## Policies (RLS)

### `Admin/manager can view inventory levels`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can delete inventory levels`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert inventory levels`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update inventory levels`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_inventory_levels_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
