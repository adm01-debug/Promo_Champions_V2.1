# public.price_protection_rules

> Tabela public.price_protection_rules. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), product_id uuid NULLABLE, min_margin_pct numeric(5,2) NULLABLE DEFAULT 10.0, target_position text NULLABLE DEFAULT 'match'::text, auto_apply boolean NULLABLE DEFAULT false, is_active boolean NULLABLE DEFAULT true, created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: product_id → public.products(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.price_protection_rules. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `product_id` | `uuid` | sim |  |  | Coluna product_id da tabela public.price_protection_rules. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.products(id). |
| 3 | `min_margin_pct` | `numeric(5,2)` | sim | `10.0` |  | Coluna min_margin_pct da tabela public.price_protection_rules. Tipo PostgreSQL: numeric(5,2). Aceita NULL. Valor padrão: 10.0. |
| 4 | `target_position` | `text` | sim | `'match'::text` |  | Coluna target_position da tabela public.price_protection_rules. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'match'::text. |
| 5 | `auto_apply` | `boolean` | sim | `false` |  | Coluna auto_apply da tabela public.price_protection_rules. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 6 | `is_active` | `boolean` | sim | `true` |  | Coluna is_active da tabela public.price_protection_rules. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 7 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.price_protection_rules. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


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
