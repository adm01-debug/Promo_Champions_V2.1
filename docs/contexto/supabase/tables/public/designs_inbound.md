# public.designs_inbound

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
| 2 | `design_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `product_name` | `text` | sim |  |  |  |
| 5 | `product_sku` | `text` | sim |  |  |  |
| 6 | `thumbnail_url` | `text` | sim |  |  |  |
| 7 | `seller_email` | `text` | sim |  |  |  |
| 8 | `last_event` | `text` | sim |  |  |  |
| 9 | `last_correlation_key` | `text` | sim |  |  |  |
| 10 | `source` | `text` | não | `'promo_design'::text` |  |  |
| 11 | `source_updated_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `raw_payload` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 13 | `received_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| designs_inbound_design_id_key | UNIQUE | `UNIQUE (design_id)` |  |  | sim |
| designs_inbound_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| designs_inbound_design_id_key | btree | design_id | sim | sim |  | `CREATE UNIQUE INDEX designs_inbound_design_id_key ON public.designs_inbound USING btree (design_id)` |
| designs_inbound_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX designs_inbound_pkey ON public.designs_inbound USING btree (id)` |
| idx_designs_inbound_product_sku | btree | product_sku | não | sim |  | `CREATE INDEX idx_designs_inbound_product_sku ON public.designs_inbound USING btree (product_sku)` |
| idx_designs_inbound_received_at | btree | received_at | não | sim |  | `CREATE INDEX idx_designs_inbound_received_at ON public.designs_inbound USING btree (received_at DESC)` |
| idx_designs_inbound_seller_email | btree | seller_email | não | sim |  | `CREATE INDEX idx_designs_inbound_seller_email ON public.designs_inbound USING btree (seller_email)` |


## Policies (RLS)

### `Admins e managers podem ler designs_inbound`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (seller_email = (auth.jwt() ->> 'email'::text)))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_designs_inbound_updated_at | BEFORE | UPDATE | ROW | enabled | public.set_designs_inbound_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
