# public.pricing_rules

> Tabela public.pricing_rules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, rule_type text NOT NULL, product_id uuid NULLABLE, min_quantity integer NULLABLE, discount_percentage numeric(5,2) NULLABLE, active boolean NULLABLE DEFAULT true, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: product_id → public.products(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.pricing_rules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.pricing_rules. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `rule_type` | `text` | não |  |  | Coluna rule_type da tabela public.pricing_rules. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `product_id` | `uuid` | sim |  |  | Coluna product_id da tabela public.pricing_rules. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.products(id). |
| 5 | `min_quantity` | `integer` | sim |  |  | Coluna min_quantity da tabela public.pricing_rules. Tipo PostgreSQL: integer. Aceita NULL. |
| 6 | `discount_percentage` | `numeric(5,2)` | sim |  |  | Coluna discount_percentage da tabela public.pricing_rules. Tipo PostgreSQL: numeric(5,2). Aceita NULL. |
| 7 | `active` | `boolean` | sim | `true` |  | Coluna active da tabela public.pricing_rules. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 8 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.pricing_rules. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


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
