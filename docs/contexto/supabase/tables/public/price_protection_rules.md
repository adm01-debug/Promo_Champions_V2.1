# public.price_protection_rules

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
| 3 | `min_margin_pct` | `numeric(5,2)` | sim | `10.0` |  |  |
| 4 | `target_position` | `text` | sim | `'match'::text` |  |  |
| 5 | `auto_apply` | `boolean` | sim | `false` |  |  |
| 6 | `is_active` | `boolean` | sim | `true` |  |  |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| price_protection_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| price_protection_rules_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_price_protection_rules_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_price_protection_rules_product_id ON public.price_protection_rules USING btree (product_id)` |
| price_protection_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX price_protection_rules_pkey ON public.price_protection_rules USING btree (id)` |


## Policies (RLS)

### `Allow read for all authenticated users`

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
