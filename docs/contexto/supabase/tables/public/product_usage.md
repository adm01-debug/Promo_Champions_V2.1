# public.product_usage

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
| 2 | `client_id` | `uuid` | não |  |  |  |
| 3 | `feature_name` | `text` | não |  |  |  |
| 4 | `usage_count` | `integer` | sim | `0` |  |  |
| 5 | `last_used_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 6 | `period_start` | `date` | sim |  |  |  |
| 7 | `period_end` | `date` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| product_usage_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| product_usage_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_product_usage_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_product_usage_client_id ON public.product_usage USING btree (client_id)` |
| product_usage_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX product_usage_pkey ON public.product_usage USING btree (id)` |


## Policies (RLS)

### `Product usage scoped visibility`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (client_id IN ( SELECT client_portfolio.client_id    FROM client_portfolio   WHERE (client_portfolio.salesperson_id = get_current_salesperson_id()))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
