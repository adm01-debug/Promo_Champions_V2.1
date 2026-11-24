# public.competitors_pricing

> Tabela public.competitors_pricing. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), product_id uuid NULLABLE, competitor_id uuid NULLABLE, price numeric(12,2) NOT NULL, source_url text NULLABLE, is_promotion boolean NULLABLE DEFAULT false, recorded_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: competitor_id → public.competitors_registry(id); product_id → public.products(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.competitors_pricing. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `product_id` | `uuid` | sim |  |  | Coluna product_id da tabela public.competitors_pricing. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.products(id). |
| 3 | `competitor_id` | `uuid` | sim |  |  | Coluna competitor_id da tabela public.competitors_pricing. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.competitors_registry(id). |
| 4 | `price` | `numeric(12,2)` | não |  |  | Coluna price da tabela public.competitors_pricing. Tipo PostgreSQL: numeric(12,2). Não aceita NULL. |
| 5 | `source_url` | `text` | sim |  |  | Coluna source_url da tabela public.competitors_pricing. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `is_promotion` | `boolean` | sim | `false` |  | Coluna is_promotion da tabela public.competitors_pricing. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 7 | `recorded_at` | `timestamp with time zone` | sim | `now()` |  | Coluna recorded_at da tabela public.competitors_pricing. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
