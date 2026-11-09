# public.pricing_rules

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
| 2 | `name` | `text` | não |  |  |  |
| 3 | `rule_type` | `text` | não |  |  |  |
| 4 | `product_id` | `uuid` | sim |  |  |  |
| 5 | `min_quantity` | `integer` | sim |  |  |  |
| 6 | `discount_percentage` | `numeric(5,2)` | sim |  |  |  |
| 7 | `active` | `boolean` | sim | `true` |  |  |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| pricing_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| pricing_rules_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pricing_rules_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_pricing_rules_product_id ON public.pricing_rules USING btree (product_id)` |
| pricing_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX pricing_rules_pkey ON public.pricing_rules USING btree (id)` |


## Policies (RLS)

### `Pricing rules are viewable by authenticated users`

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
