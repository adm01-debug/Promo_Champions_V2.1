# public.stock_movements

> Movimentações de entrada, saída ou ajuste de estoque.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único da movimentação. |
| 2 | `product_id` | `uuid` | sim |  |  | Produto afetado pela movimentação, quando informado. |
| 3 | `movement_type` | `text` | não |  |  | Tipo de movimentação: entry, exit ou adjustment. |
| 4 | `quantity` | `integer` | não |  |  | Quantidade de unidades movimentadas. |
| 5 | `reason` | `text` | sim |  |  | Motivo ou contexto da movimentação, quando informado. |
| 6 | `reference_id` | `uuid` | sim |  |  | Identificador de referência relacionado à movimentação, quando aplicável. |
| 7 | `performed_by` | `uuid` | sim |  |  | Identificador de quem realizou a movimentação, quando registrado. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de registro da movimentação. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| stock_movements_movement_type_check | CHECK | `CHECK (movement_type = ANY (ARRAY['entry'::text, 'exit'::text, 'adjustment'::text]))` |  |  | sim |
| stock_movements_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| stock_movements_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_stock_movements_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_stock_movements_created_at ON public.stock_movements USING btree (created_at)` |
| idx_stock_movements_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_stock_movements_product_id ON public.stock_movements USING btree (product_id)` |
| stock_movements_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX stock_movements_pkey ON public.stock_movements USING btree (id)` |


## Policies (RLS)

### `Admin/manager can view stock movements`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert stock movements`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
