# public.competitors_pricing

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
| 3 | `competitor_id` | `uuid` | sim |  |  |  |
| 4 | `price` | `numeric(12,2)` | não |  |  |  |
| 5 | `source_url` | `text` | sim |  |  |  |
| 6 | `is_promotion` | `boolean` | sim | `false` |  |  |
| 7 | `recorded_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| competitors_pricing_competitor_id_fkey | FOREIGN KEY | `FOREIGN KEY (competitor_id) REFERENCES competitors_registry(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| competitors_pricing_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| competitors_pricing_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| competitors_pricing_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX competitors_pricing_pkey ON public.competitors_pricing USING btree (id)` |
| idx_competitors_pricing_competitor_id | btree | competitor_id | não | sim |  | `CREATE INDEX idx_competitors_pricing_competitor_id ON public.competitors_pricing USING btree (competitor_id)` |
| idx_competitors_pricing_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_competitors_pricing_product_id ON public.competitors_pricing USING btree (product_id)` |


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

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| on_competitor_price_update | AFTER | INSERT | ROW | enabled | public.check_price_threats |


## Grants

_nenhum_
